"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  cartTable,
  inventoryItemTable,
  orderItemTable,
  orderTable,
  reservationTable,
} from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

export const finishOrder = async () => {
  const userId = await requireAuth();
  if (!userId) {
    throw new Error("Unauthorized");
  }

  const cart = await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, userId),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: true,
        },
      },
    },
  });
  if (!cart) {
    throw new Error("Cart not found");
  }
  if (!cart.shippingAddress) {
    throw new Error("Shipping address not found");
  }
  const totalPriceInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );
  let orderId: string | undefined;
  let reservationExpiresAt: Date | undefined;
  const isStrict = process.env.INVENTORY_STRICT === "true";
  await db.transaction(async (tx) => {
    if (!cart.shippingAddress) {
      throw new Error("Shipping address not found");
    }
    const [order] = await tx
      .insert(orderTable)
      .values({
        email: cart.shippingAddress.email,
        zipCode: cart.shippingAddress.zipCode,
        country: cart.shippingAddress.country,
        phone: cart.shippingAddress.phone,
        cpfOrCnpj: cart.shippingAddress.cpfOrCnpj,
        city: cart.shippingAddress.city,
        complement: cart.shippingAddress.complement,
        neighborhood: cart.shippingAddress.neighborhood,
        number: cart.shippingAddress.number,
        recipientName: cart.shippingAddress.recipientName,
        state: cart.shippingAddress.state,
        street: cart.shippingAddress.street,
        userId: userId,
        totalPriceInCents,
        shippingAddressId: cart.shippingAddress!.id,
      })
      .returning();
    if (!order) {
      throw new Error("Failed to create order");
    }
    orderId = order.id;
    const orderItemsPayload: Array<typeof orderItemTable.$inferInsert> = [];

    const stockChecks: Array<{
      item: (typeof cart.items)[number];
      stockRow: typeof inventoryItemTable.$inferSelect | undefined;
    }> = [];

    for (const item of cart.items) {
      const stock = await tx.query.inventoryItemTable.findFirst({
        where: (t, { and, eq, isNull }) =>
          and(
            eq(t.productVariantId, item.productVariant.id),
            item.productVariantSizeId
              ? eq(t.productVariantSizeId, item.productVariantSizeId)
              : isNull(t.productVariantSizeId),
          ),
      });
      stockChecks.push({ item, stockRow: stock });
    }

    const insufficient: Array<{
      productVariantId: string;
      variantName?: string | null;
      requested: number;
      available: number;
    }> = [];

    for (const chk of stockChecks) {
      const { item, stockRow } = chk;
      if (!stockRow) {
        if (isStrict) {
          throw new Error("Produto sem controle de estoque configurado");
        }
        continue;
      }
      const available = stockRow.quantity ?? 0;
      if (available < item.quantity) {
        insufficient.push({
          productVariantId: item.productVariant.id,
          variantName: item.productVariant.name ?? null,
          requested: item.quantity,
          available,
        });
      }
    }

    if (insufficient.length > 0) {
      throw new Error(
        JSON.stringify({ code: "INSUFFICIENT_STOCK", items: insufficient }),
      );
    }

    for (const chk of stockChecks) {
      const { item } = chk;
      orderItemsPayload.push({
        orderId: order.id,
        productVariantId: item.productVariant.id,
        productVariantSizeId: item.productVariantSizeId ?? null,
        quantity: item.quantity,
        priceInCents: item.productVariant.priceInCents,
      });
    }

    await tx.insert(orderItemTable).values(orderItemsPayload);

    const reserveMinutes = Number(process.env.RESERVATION_MINUTES) || 15;
    const expiresAt = new Date(Date.now() + reserveMinutes * 60 * 1000);
    const reservationsPayload = orderItemsPayload.map((oi) => ({
      orderId: oi.orderId,
      productVariantId: oi.productVariantId,
      productVariantSizeId: oi.productVariantSizeId ?? null,
      quantity: oi.quantity,
      expiresAt,
    }));
    await tx.insert(reservationTable).values(reservationsPayload);
    reservationExpiresAt = expiresAt;
  });
  if (!orderId) {
    throw new Error("Failed to create order");
  }
  return { orderId, expiresAt: reservationExpiresAt?.toISOString() };
};
