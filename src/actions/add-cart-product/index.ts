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
    where: (cartItem, { eq }) =>
      eq(cartItem.cartId, cartId) &&
      eq(cartItem.productVariantId, data.productVariantId),
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
    quantity: data.quantity,
  });
};
