'use server';

import { and, eq } from 'drizzle-orm';

import { db } from '@/db';
import { cartTable, shippingAddressTable } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';

import { DeleteShippingAddressSchema, deleteShippingAddressSchema } from './schema';

type DeleteShippingAddressResult = { success: true } | { success: false; message: string };

export const deleteShippingAddress = async (
  data: DeleteShippingAddressSchema,
): Promise<DeleteShippingAddressResult> => {
  try {
    deleteShippingAddressSchema.parse(data);

    const userId = await requireAuth();

    const address = await db.query.shippingAddressTable.findFirst({
      where: (t, { eq, and }) => and(eq(t.id, data.shippingAddressId), eq(t.userId, userId)),
    });
    if (!address) {
      return {
        success: false,
        message: 'Endereço não encontrado ou não autorizado',
      };
    }

    const usedInOrder = await db.query.orderTable.findFirst({
      where: (t, { eq, and }) =>
        and(eq(t.userId, userId), eq(t.shippingAddressId, data.shippingAddressId)),
    });
    if (usedInOrder) {
      return {
        success: false,
        message: 'Este endereço está vinculado a um pedido e não pode ser excluído.',
      };
    }

    const cart = await db.query.cartTable.findFirst({
      where: (t, { eq }) => eq(t.userId, userId),
    });
    if (cart && cart.shippingAddressId === data.shippingAddressId) {
      await db.update(cartTable).set({ shippingAddressId: null }).where(eq(cartTable.id, cart.id));
    }

    await db
      .delete(shippingAddressTable)
      .where(
        and(
          eq(shippingAddressTable.id, data.shippingAddressId),
          eq(shippingAddressTable.userId, userId),
        ),
      );

    return { success: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro ao excluir endereço';
    return { success: false, message };
  }
};
