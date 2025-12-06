'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { shippingAddressTable } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';
import { logger } from '@/lib/logger';

export async function getUserAddresses() {
  const userId = await requireAuth();

  if (!userId) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const addresses = await db
      .select()
      .from(shippingAddressTable)
      .where(eq(shippingAddressTable.userId, userId))
      .orderBy(shippingAddressTable.createdAt);

    return addresses;
  } catch (error) {
    logger.error('Erro ao buscar endereços:', error);
    throw new Error('Erro ao buscar endereços');
  }
}
