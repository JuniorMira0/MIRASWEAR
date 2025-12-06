'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

import { db } from '@/db';
import { shippingAddressTable, userTable } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';

import { CreateShippingAddressSchema, createShippingAddressSchema } from './schema';

export const createShippingAddress = async (data: CreateShippingAddressSchema) => {
  createShippingAddressSchema.parse(data);

  const userId = await requireAuth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const [user] = await db
    .select({
      email: userTable.email,
      name: userTable.name,
      cpf: userTable.cpf,
      phone: userTable.phone,
    })
    .from(userTable)
    .where(eq(userTable.id, userId))
    .limit(1);

  if (!user?.email || !user?.name) {
    throw new Error('User profile incomplete');
  }

  const [shippingAddress] = await db
    .insert(shippingAddressTable)
    .values({
      userId: userId,
      recipientName: user.name,
      street: data.address,
      number: data.number,
      complement: data.complement || null,
      city: data.city,
      state: data.state,
      neighborhood: data.neighborhood,
      zipCode: data.zipCode,
      country: 'Brasil',
      phone: user.phone || '',
      email: user.email,
      cpfOrCnpj: user.cpf || '',
    })
    .returning();

  revalidatePath('/cart/identification');

  return shippingAddress;
};
