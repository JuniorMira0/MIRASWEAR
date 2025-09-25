import { NextResponse } from 'next/server';

import { setCpf as setCpfAction } from '@/actions/set-cpf';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { cpf } = body || {};
    if (!cpf) return NextResponse.json({ error: 'CPF ausente' }, { status: 400 });

    try {
      await setCpfAction(cpf);
      return NextResponse.json({ success: true });
    } catch (e: any) {
      return NextResponse.json({ error: e?.message || String(e) }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
