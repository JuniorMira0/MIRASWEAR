import { updateProductVariant } from '@/actions/products/update-variant';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await updateProductVariant(body);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = (err as any)?.message ?? 'Erro desconhecido';
    return new NextResponse(JSON.stringify({ ok: false, error: message }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}
