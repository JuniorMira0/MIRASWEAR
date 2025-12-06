import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { db } from '@/db';
import { cartTable, inventoryItemTable, orderTable, reservationTable } from '@/db/schema';

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.error();
  }
  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.error();
  }
  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const event = stripe.webhooks.constructEvent(text, signature, process.env.STRIPE_WEBHOOK_SECRET);
  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      const userId = session.metadata?.userId;

      if (!orderId) {
        return NextResponse.error();
      }

      await db.transaction(async tx => {
        const existing = await tx.query.orderTable.findFirst({
          where: (t, { eq }) => eq(t.id, orderId),
          with: { items: true },
        });
        if (!existing) return;
        if (existing.status === 'paid') return;

        const reservations = await tx.query.reservationTable.findMany({
          where: (r, { eq }) => eq(r.orderId, orderId),
        });

        for (const it of existing.items) {
          const res = reservations.find(
            r =>
              r.productVariantId === it.productVariantId &&
              r.productVariantSizeId === it.productVariantSizeId,
          );
          if (
            !res ||
            (res.quantity ?? 0) < it.quantity ||
            (res.expiresAt ?? new Date(0)) < new Date()
          ) {
            await tx
              .update(orderTable)
              .set({ status: 'canceled' })
              .where(eq(orderTable.id, orderId));
            console.warn(`Order ${orderId} canceled: reservation missing/expired`);
            await tx.delete(reservationTable).where(eq(reservationTable.orderId, orderId));
            return;
          }
        }

        for (const res of reservations) {
          const stock = await tx.query.inventoryItemTable.findFirst({
            where: (t, { and, eq, isNull }) =>
              and(
                eq(t.productVariantId, res.productVariantId),
                res.productVariantSizeId
                  ? eq(t.productVariantSizeId, res.productVariantSizeId)
                  : isNull(t.productVariantSizeId),
              ),
          });
          if (stock) {
            const available = stock.quantity ?? 0;
            await tx
              .update(inventoryItemTable)
              .set({ quantity: available - res.quantity })
              .where(eq(inventoryItemTable.id, stock.id));
          }
        }

        await tx.delete(reservationTable).where(eq(reservationTable.orderId, orderId));
        await tx.update(orderTable).set({ status: 'paid' }).where(eq(orderTable.id, orderId));
        if (userId) {
          await tx.delete(cartTable).where(eq(cartTable.userId, userId));
        }
      });
    }

    if (event.type === 'checkout.session.expired') {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await db.transaction(async tx => {
          await tx.update(orderTable).set({ status: 'canceled' }).where(eq(orderTable.id, orderId));
          await tx.delete(reservationTable).where(eq(reservationTable.orderId, orderId));
        });
      }
    }
  } catch (err) {
    console.error('Error handling stripe webhook:', err);
    return NextResponse.error();
  }
  return NextResponse.json({ received: true });
};
