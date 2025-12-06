import { NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/db';

const VariantIdSchema = z.object({ variantId: z.string().min(1) });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = VariantIdSchema.safeParse(body);
    if (!parsed.success)
      return NextResponse.json(
        { ok: false, error: 'variantId required or invalid' },
        { status: 400 },
      );
    const variantId = parsed.data.variantId;

    const items = await db.query.inventoryItemTable.findMany({
      where: (t, { eq }) => eq(t.productVariantId, variantId),
    });
    return NextResponse.json({ ok: true, items });
  } catch (err: unknown) {
    const e: any = err;
    const payload: any = {
      ok: false,
      error: e?.message ?? 'Erro desconhecido',
    };
    if (e?.stack) payload.stack = e.stack;
    return NextResponse.json(payload, { status: 500 });
  }
}
