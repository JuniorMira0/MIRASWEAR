import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';

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

    let variantRows: any[] = [];
    try {
      variantRows = await db.query.productVariantTable.findMany({
        where: pv => sql`(
          (unaccent(${pv.name}) ILIKE ${param} OR unaccent(${pv.color}) ILIKE ${param})
          AND ${pv.isActive} = true
          AND EXISTS (SELECT 1 FROM product p WHERE p.id = ${pv.productId} AND p.is_active = true)
        )`,
        limit: 20,
        with: { product: true },
      });
    } catch (e) {
      const accents = 'áàãâäéèêëíìîïóòõôöúùûüçñ';
      const replacements = 'aaaaaeeeeiiiiooooouuuucn';
      variantRows = await db.query.productVariantTable.findMany({
        where: pv => sql`(
          (translate(lower(${pv.name}), ${sql`${accents}`}, ${sql`${replacements}`}) ILIKE ${paramNormalized} OR translate(lower(${pv.color}), ${sql`${accents}`}, ${sql`${replacements}`}) ILIKE ${paramNormalized})
          AND ${pv.isActive} = true
          AND EXISTS (SELECT 1 FROM product p WHERE p.id = ${pv.productId} AND p.is_active = true)
        )`,
        limit: 20,
        with: { product: true },
      });
    }

    let productRows: any[] = [];
    try {
      productRows = await db.query.productTable.findMany({
        where: p => sql`unaccent(${p.name}) ILIKE ${param} AND ${p.isActive} = true`,
        limit: 20,
      });
    } catch (e) {
      const accents = 'áàãâäéèêëíìîïóòõôöúùûüçñ';
      const replacements = 'aaaaaeeeeiiiiooooouuuucn';
      productRows = await db.query.productTable.findMany({
        where: p =>
          sql`translate(lower(${p.name}), ${sql`${accents}`}, ${sql`${replacements}`}) ILIKE ${paramNormalized} AND ${p.isActive} = true`,
        limit: 20,
      });
    }

    const variantsFromProducts: any[] = [];
    for (const p of productRows) {
      const v = await db.query.productVariantTable.findFirst({
        where: pv => sql`${pv.productId} = ${p.id} AND ${pv.isActive} = true`,
        with: { product: true },
      });
      if (v) variantsFromProducts.push({ ...v, product: p });
    }

    let chosenVariants: any[] = [];
    if (variantRows && variantRows.length > 0) {
      const byProduct = new Map<string, any>();
      for (const v of variantRows) {
        const productId = v.product?.id ?? v.productId ?? v.product_id ?? null;
        const key = productId ?? v.id;
        if (!byProduct.has(key)) byProduct.set(key, v);
      }
      chosenVariants = Array.from(byProduct.values());
    } else {
      chosenVariants = variantsFromProducts || [];
    }

    const allVariantsMap = new Map<string, any>();
    for (const r of chosenVariants) allVariantsMap.set(r.id, r);

    const mapped = Array.from(allVariantsMap.values())
      .slice(0, 20)
      .map((r: any) => ({
        id: r.id,
        productName: r.product?.name ?? null,
        variantName: r.name ?? null,
        productSlug: r.product?.slug ?? null,
        variantSlug: r.slug,
        imageUrl: r.imageUrl ?? null,
        priceInCents: r.priceInCents ?? null,
      }));

    return NextResponse.json({ results: mapped });
  } catch (err) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
