import { NextResponse } from 'next/server';

import { createCategory } from '@/actions/categories/create';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || '');
    const slug = String(body.slug || '');
    const created = await createCategory(name, slug);
    return NextResponse.json(created);
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || String(err) }, { status: 400 });
  }
}
