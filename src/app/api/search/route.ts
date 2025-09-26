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
        AND EXISTS (
          SELECT 1
          FROM ${inventoryItemTable}
          WHERE ${inventoryItemTable.productVariantId} = ${productVariantTable.id}
            AND ${inventoryItemTable.quantity} > 0
        )
      )`;
    };

    const runVariantQuery = async (whereClause: SQL) => {
      return db
        .select({
          id: productVariantTable.id,
          productId: productVariantTable.productId,
          variantName: productVariantTable.name,
          variantSlug: productVariantTable.slug,
          imageUrl: productVariantTable.imageUrl,
          priceInCents: productVariantTable.priceInCents,
          productName: productTable.name,
          productSlug: productTable.slug,
        })
        .from(productVariantTable)
        .innerJoin(productTable, eq(productVariantTable.productId, productTable.id))
        .where(whereClause)
        .orderBy(productTable.name, productVariantTable.name)
        .limit(60);
    };

    let variantRows: Array<{
      id: string;
      productId: string;
      variantName: string;
      variantSlug: string;
      imageUrl: string | null;
      priceInCents: number | null;
      productName: string;
      productSlug: string;
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

    const byProduct = new Map<string, (typeof variantRows)[number]>();
    for (const variant of variantRows) {
      const key = variant.productId ?? variant.id;
      if (!byProduct.has(key)) {
        byProduct.set(key, variant);
      }
    }

    const mapped = Array.from(byProduct.values())
      .slice(0, 20)
      .map(variant => ({
        id: variant.id,
        productName: variant.productName ?? null,
        variantName: variant.variantName ?? null,
        productSlug: variant.productSlug ?? null,
        variantSlug: variant.variantSlug,
        imageUrl: variant.imageUrl ?? null,
        priceInCents: variant.priceInCents ?? null,
      }));

    return NextResponse.json({ results: mapped });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
