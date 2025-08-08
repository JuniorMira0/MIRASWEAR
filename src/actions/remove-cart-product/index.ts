"use server";

import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import z from "zod";

import { db } from "@/db";
import { cartItemTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import { removeProductFromCartSchema } from "./schema";

/**
 * Action para remover um produto do carrinho de compras
 * Esta função é executada no servidor (server action)
 */
export const removeProductFromCart = async (
  data: z.infer<typeof removeProductFromCartSchema>,
) => {
  // Valida os dados de entrada usando o schema Zod
  removeProductFromCartSchema.parse(data);

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

  // Remove o item do carrinho do banco de dados
  await db.delete(cartItemTable).where(eq(cartItemTable.id, cartItem.id));
};
