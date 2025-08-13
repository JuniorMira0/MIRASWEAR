"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

import { AddProductToCartSchema, addProductToCartSchema } from "./schema";

export const addProductToCart = async (data: AddProductToCartSchema) => {
  // Valida o schema de entrada
  addProductToCartSchema.parse(data);
  
  // Obtém o userId autenticado (substitui 5 linhas por 1!)
  const userId = await requireAuth();

  // Verifica se a variante do produto existe
  const productVariant = await db.query.productVariantTable.findFirst({
    where: (productVariant, { eq }) =>
      eq(productVariant.id, data.productVariantId),
  });
  if (!productVariant) {
    throw new Error("Product variant not found");
  }

  // Busca o carrinho do usuário
  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, userId),
  });
  let cartId = cart?.id;

  // Cria carrinho se não existir
  if (!cartId) {
    const [newCart] = await db
      .insert(cartTable)
      .values({
        userId,
      })
      .returning();
    cartId = newCart.id;
  }

  // Verifica se o item já existe no carrinho
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) =>
      eq(cartItem.cartId, cartId) &&
      eq(cartItem.productVariantId, data.productVariantId),
  });

  if (cartItem) {
    // Atualiza quantidade se item já existe
    await db
      .update(cartItemTable)
      .set({
        quantity: cartItem.quantity + data.quantity,
      })
      .where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  // Adiciona novo item ao carrinho
  await db.insert(cartItemTable).values({
    cartId,
    productVariantId: data.productVariantId,
    quantity: data.quantity,
  });
};
