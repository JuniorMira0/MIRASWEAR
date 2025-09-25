'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { cartTable } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';

import { UpdateCartShippingAddressSchema, updateCartShippingAddressSchema } from './schema';

export const updateCartShippingAddress = async (data: UpdateCartShippingAddressSchema) => {
  updateCartShippingAddressSchema.parse(data);

  const userId = await requireAuth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const shippingAddress = await db.query.shippingAddressTable.findFirst({
    where: (shippingAddress, { eq, and }) =>
      and(eq(shippingAddress.id, data.shippingAddressId), eq(shippingAddress.userId, userId)),
  });

  if (!shippingAddress) {
    throw new Error('Shipping address not found or unauthorized');
  }

  const cart = await db.query.cartTable.findFirst({
    where: (cart, { eq }) => eq(cart.userId, userId),
  });

  if (!cart) {
    throw new Error('Cart not found');
  }

  await db
    .update(cartTable)
    .set({
      shippingAddressId: data.shippingAddressId,
    })
    .where(eq(cartTable.id, cart.id));

  return { success: true };
};
