import { desc, eq } from 'drizzle-orm';

import { db } from '@/db';
import { reservationTable } from '@/db/schema';

import CancelClient from './client';

type Props = { searchParams?: { orderId?: string } };

export default async function CancelPage({ searchParams }: Props) {
  const orderId = searchParams?.orderId;
  let expiresAt: string | null = null;

  if (orderId) {
    const reservation = await db.query.reservationTable.findFirst({
      where: eq(reservationTable.orderId, orderId),
      orderBy: [desc(reservationTable.createdAt)],
    });
    if (reservation) expiresAt = reservation.expiresAt.toISOString();
  }

  return <CancelClient expiresAt={expiresAt} />;
}
