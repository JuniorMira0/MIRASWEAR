"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

import { AddProductToCartSchema, addProductToCartSchema } from "./schema";

export const addProductToCart = async (data: AddProductToCartSchema) => {
  addProductToCartSchema.parse(data);
  const userId = await requireAuth();

  const productVariant = await db.query.productVariantTable.findFirst({
    where: (productVariant, { eq }) =>
      eq(productVariant.id, data.productVariantId),
  });
  if (!productVariant) {
    throw new Error("Product variant not found");
  }

  if (data.productVariantSizeId) {
    const size = await db.query.productVariantSizeTable.findFirst({
      where: (t, { eq, and }) =>
        and(
          eq(t.id, data.productVariantSizeId!),
          eq(t.productVariantId, data.productVariantId),
        ),
    });
    if (!size) {
      throw new Error("Selected size not found for this variant");
    }
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, userId),
  });
  let cartId = cart?.id;

  if (!cartId) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId,
      })
      .returning();
    cartId = newCart.id;
  }

  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq, and, isNull }) =>
      and(
        eq(cartItem.cartId, cartId),
        eq(cartItem.productVariantId, data.productVariantId),
        data.productVariantSizeId
          ? eq(cartItem.productVariantSizeId, data.productVariantSizeId)
          : isNull(cartItem.productVariantSizeId),
      ),
  });

  if (cartItem) {
    await db
      .update(cartItemTable)
      .set({
        quantity: cartItem.quantity + data.quantity,
      })
      .where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  await db.insert(cartItemTable).values({
    cartId,
    productVariantId: data.productVariantId,
    productVariantSizeId: data.productVariantSizeId ?? null,
    quantity: data.quantity,
  });
};
