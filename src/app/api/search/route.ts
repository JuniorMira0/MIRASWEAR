import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const qRaw = String(url.searchParams.get('q') || '').trim();
    const q = qRaw;
    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    const param = `%${q}%`;
    const rows = await db.query.productVariantTable.findMany({
      where: (pv, { or, ilike }) =>
        or(ilike(pv.name, param), ilike(pv.color, param)),
      limit: 20,
      with: { product: true },
    });

    const mapped = (rows || []).map((r: any) => ({
      id: r.id,
      name: r.name,
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
