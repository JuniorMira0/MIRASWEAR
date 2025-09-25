'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { userTable } from '@/db/schema';
import { isValidCPF } from '@/helpers/br-validators';
import { requireAuth } from '@/lib/auth-middleware';

export const setCpf = async (cpf: string) => {
  const userId = await requireAuth();
  if (!userId) throw new Error('Unauthorized');

  const clean = (cpf || '').replace(/\D/g, '');
  if (!isValidCPF(clean)) throw new Error('CPF inválido');

  // ensure user doesn't already have CPF
  const [current] = await db.select().from(userTable).where(eq(userTable.id, userId));
  if (!current) throw new Error('User not found');
  if (current.cpf) throw new Error('CPF já definido e não pode ser alterado');

  // uniqueness
  const [existing] = await db.select().from(userTable).where(eq(userTable.cpf, clean));
  if (existing) throw new Error('CPF já cadastrado');

  await db.update(userTable).set({ cpf: clean }).where(eq(userTable.id, userId));

  return { success: true };
};
