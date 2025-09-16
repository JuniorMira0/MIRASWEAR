import { NextResponse } from 'next/server';
import { db } from '@/db';
import { inventoryItemTable } from '@/db/schema';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const variantId = body.variantId as string;
    if (!variantId) return NextResponse.json({ ok: false, error: 'variantId required' }, { status: 400 });

    const items = await db.query.inventoryItemTable.findMany({ where: (t, { eq }) => eq(t.productVariantId, variantId) });
    return NextResponse.json({ ok: true, items });
  } catch (err: unknown) {
    const message = (err as any)?.message ?? 'Erro desconhecido';
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
