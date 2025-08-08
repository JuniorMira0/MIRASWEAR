"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { decreaseCartProductQuantitySchema } from "./schema";

/**
 * Action para diminuir a quantidade de um produto no carrinho
 * Se a quantidade chegar a 1, remove o item completamente do carrinho
 * Esta função é executada no servidor (server action)
 */
export const decreaseCartProductQuantity = async (
  data: z.infer<typeof decreaseCartProductQuantitySchema>,
) => {
  // Valida os dados de entrada usando o schema Zod
  decreaseCartProductQuantitySchema.parse(data);

  // Obtém a sessão do usuário autenticado através dos headers da requisição
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Verifica se o usuário está autenticado
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Busca o item do carrinho no banco de dados
  // Inclui os dados do carrinho relacionado para verificação de propriedade
  const cartItem = await db.query.cartItemTable.findFirst({
    where: (cartItem, { eq }) => eq(cartItem.id, data.cartItemId),
    with: {
      cart: true, // Inclui dados do carrinho para verificar se pertence ao usuário
    },
  });

  // Verifica se o item do carrinho existe
  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // Verifica se o carrinho pertence ao usuário autenticado (segurança)
  const cartDoesNotBelongToUser = cartItem.cart.userId !== session.user.id;
  if (cartDoesNotBelongToUser) {
    throw new Error("Unauthorized");
  }

  // Se a quantidade atual é 1, remove o item completamente do carrinho
  // Evita ter itens com quantidade 0 ou negativa
  if (cartItem.quantity === 1) {
    await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
    return;
  }

  // Caso contrário, diminui a quantidade em 1 unidade
  await db
    .update(cartItemTable)
    .set({ quantity: cartItem.quantity - 1 })
    .where(eq(cartItemTable.id, cartItem.id));
};
