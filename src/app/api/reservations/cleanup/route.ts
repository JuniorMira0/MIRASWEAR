import { lt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { db } from '@/db';
import { reservationTable } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';

export const POST = async () => {
  const userId = await requireAuth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  await db.delete(reservationTable).where(lt(reservationTable.expiresAt, new Date()));
  return NextResponse.json({ ok: true });
};
