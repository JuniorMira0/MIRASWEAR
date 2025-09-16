import { db } from '@/db';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const variantId = body.variantId as string;
    if (!variantId) return NextResponse.json({ ok: false, error: 'variantId required' }, { status: 400 });

    const items = await db.query.inventoryItemTable.findMany({ where: (t, { eq }) => eq(t.productVariantId, variantId) });
    return NextResponse.json({ ok: true, items });
  } catch (err: unknown) {
    const e: any = err;
    const payload: any = { ok: false, error: e?.message ?? 'Erro desconhecido' };
    if (e?.stack) payload.stack = e.stack;
    return NextResponse.json(payload, { status: 500 });
  }
}
