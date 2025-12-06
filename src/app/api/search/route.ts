import { eq, type SQL, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { inventoryItemTable, productTable, productVariantTable } from '@/db/schema';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qRaw = String(url.searchParams.get('q') || '').trim();
    const q = qRaw;
    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    const param = `%${q}%`;
    const normalize = (s: string) =>
      s
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    const paramNormalized = `%${normalize(q)}%`;

    const accents = 'áàãâäéèêëíìîïóòõôöúùûüçñ';
    const replacements = 'aaaaaeeeeiiiiooooouuuucn';

    const buildWhereClause = (useUnaccent: boolean): SQL => {
      const variantNameExpr = useUnaccent
        ? sql`unaccent(${productVariantTable.name})`
        : sql`translate(lower(${productVariantTable.name}), ${sql`${accents}`}, ${sql`${replacements}`})`;
      const variantColorExpr = useUnaccent
        ? sql`unaccent(${productVariantTable.color})`
        : sql`translate(lower(${productVariantTable.color}), ${sql`${accents}`}, ${sql`${replacements}`})`;
      const productNameExpr = useUnaccent
        ? sql`unaccent(${productTable.name})`
        : sql`translate(lower(${productTable.name}), ${sql`${accents}`}, ${sql`${replacements}`})`;

      const searchParam = useUnaccent ? param : paramNormalized;

      return sql`(
        (${variantNameExpr} ILIKE ${searchParam}
          OR ${variantColorExpr} ILIKE ${searchParam}
          OR ${productNameExpr} ILIKE ${searchParam})
        AND ${productVariantTable.isActive} = true
        AND ${productTable.isActive} = true
      )`;
    };

    const runVariantQuery = async (whereClause: SQL) => {
      return db
        .select({
          productId: productTable.id,
          productName: productTable.name,
          productDescription: productTable.description,
          productSlug: productTable.slug,
          variantId: productVariantTable.id,
          variantName: productVariantTable.name,
          variantSlug: productVariantTable.slug,
          variantImageUrl: productVariantTable.imageUrl,
          variantPriceInCents: productVariantTable.priceInCents,
          stock: sql<number>`COALESCE(SUM(${inventoryItemTable.quantity}), 0)`,
        })
        .from(productVariantTable)
        .innerJoin(productTable, eq(productVariantTable.productId, productTable.id))
        .leftJoin(
          inventoryItemTable,
          eq(inventoryItemTable.productVariantId, productVariantTable.id),
        )
        .where(whereClause)
        .groupBy(
          productTable.id,
          productTable.name,
          productTable.description,
          productTable.slug,
          productVariantTable.id,
          productVariantTable.name,
          productVariantTable.slug,
          productVariantTable.imageUrl,
          productVariantTable.priceInCents,
        )
        .orderBy(productTable.name, productVariantTable.name)
        .limit(100);
    };

    let variantRows: Array<{
      productId: string;
      productName: string;
      productDescription: string | null;
      productSlug: string | null;
      variantId: string;
      variantName: string;
      variantSlug: string | null;
      variantImageUrl: string | null;
      variantPriceInCents: number | null;
      stock: number;
    }> = [];

    let usedFallback = false;
    try {
      variantRows = await runVariantQuery(buildWhereClause(true));
    } catch {
      usedFallback = true;
      variantRows = await runVariantQuery(buildWhereClause(false));
    }

    if (!usedFallback && variantRows.length === 0) {
      variantRows = await runVariantQuery(buildWhereClause(false));
    }

    const productsMap = new Map<
      string,
      {
        id: string;
        name: string;
        description: string | null;
        slug: string | null;
        variants: {
          id: string;
          name: string;
          slug: string;
          imageUrl: string;
          priceInCents: number | null;
          stock: number;
        }[];
      }
    >();

    for (const row of variantRows) {
      if (!row.variantSlug || !row.variantImageUrl) {
        continue;
      }

      const existing = productsMap.get(row.productId);
      const product = existing ?? {
        id: row.productId,
        name: row.productName,
        description: row.productDescription ?? null,
        slug: row.productSlug ?? null,
        variants: [],
      };

      product.variants.push({
        id: row.variantId,
        name: row.variantName,
        slug: row.variantSlug,
        imageUrl: row.variantImageUrl,
        priceInCents: row.variantPriceInCents ?? null,
        stock: Number(row.stock ?? 0),
      });

      if (!existing) {
        productsMap.set(row.productId, product);
      }
    }

    const mapped = Array.from(productsMap.values())
      .filter(product => product.variants.length > 0)
      .slice(0, 20);

    return NextResponse.json({ results: mapped });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
