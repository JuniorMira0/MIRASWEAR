import { deleteProduct } from '@/actions/products/delete';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await deleteProduct(body);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const e: any = err;
    const payload: any = { ok: false, error: e?.message ?? 'Erro desconhecido' };
    if (e?.stack) payload.stack = e.stack;
    return new NextResponse(JSON.stringify(payload), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
