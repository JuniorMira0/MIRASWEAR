"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  cartTable,
  inventoryItemTable,
  orderItemTable,
  orderTable,
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
      if (!stock) {
        if (isStrict) {
          throw new Error("Produto sem controle de estoque configurado");
        }
      } else {
        const available = stock.quantity ?? 0;
        if (available < item.quantity) {
          throw new Error("Estoque insuficiente para concluir o pedido");
        }
        await tx
          .update(inventoryItemTable)
          .set({ quantity: available - item.quantity })
          .where(eq(inventoryItemTable.id, stock.id));
      }

      orderItemsPayload.push({
        orderId: order.id,
        productVariantId: item.productVariant.id,
        productVariantSizeId: item.productVariantSizeId ?? null,
        quantity: item.quantity,
        priceInCents: item.productVariant.priceInCents,
      });
    }
    await tx.insert(orderItemTable).values(orderItemsPayload);
  });
  if (!orderId) {
    throw new Error("Failed to create order");
  }
  return { orderId };
};
