import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const q = String(url.searchParams.get('q') || '').trim();
    if (!q || q.length < 2) return NextResponse.json({ results: [] });

    const results = await db.query.productTable.findMany({
      where: (t, { or, like }) => or(like(t.name, `%${q}%`), like(t.description, `%${q}%`)),
      limit: 20,
    });

    const mapped = results.map((r) => ({ id: r.id, name: r.name, slug: r.slug }));
    return NextResponse.json({ results: mapped });
  } catch (err) {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
