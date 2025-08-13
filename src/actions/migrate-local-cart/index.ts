"use server";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";
import { eq } from 'drizzle-orm';

export interface LocalCartItem {
  productVariantId: string;
  quantity: number;
  productName?: string;
  productVariantName?: string;
  productVariantImageUrl?: string;
  productVariantPriceInCents?: number;
}

export const migrateLocalCartToServer = async (
  localCartItems: LocalCartItem[],
) => {
  if (localCartItems.length === 0) return;

  const userId = await requireAuth();

  // Busca ou cria carrinho do usuário
  let cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, userId),
  });

  if (!cart) {
    const [newCart] = await db.insert(cartTable).values({ userId }).returning();
    cart = newCart;
  }

  // Para cada item do carrinho local
  for (const localItem of localCartItems) {
    // Verifica se já existe no carrinho do servidor
    const existingItem = await db.query.cartItemTable.findFirst({
      where: (cartItem, { eq, and }) =>
        and(
          eq(cartItem.cartId, cart.id),
          eq(cartItem.productVariantId, localItem.productVariantId),
        ),
    });

    if (existingItem) {
      // Se existe, soma as quantidades
      await db
        .update(cartItemTable)
        .set({
          quantity: existingItem.quantity + localItem.quantity,
        })
        .where(eq(cartItemTable.id, existingItem.id));
    } else {
      // Se não existe, cria novo item
      await db.insert(cartItemTable).values({
        cartId: cart.id,
        productVariantId: localItem.productVariantId,
        quantity: localItem.quantity,
      });
    }
  }
};
