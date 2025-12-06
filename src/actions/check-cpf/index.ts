'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { userTable } from '@/db/schema';

export const checkCpfExists = async (cpf: string) => {
  const clean = (cpf || '').replace(/\D/g, '');
  if (!clean) return false;
  const [user] = await db.select().from(userTable).where(eq(userTable.cpf, clean));
  return !!user;
};
