'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { userTable } from '@/db/schema';
import { isValidCPF } from '@/helpers/br-validators';
import { requireAuth } from '@/lib/auth-middleware';

import { updateUserSchema } from './schema';

export const updateUser = async (data: unknown) => {
  const parsed = updateUserSchema.parse(data);

  const userId = await requireAuth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  const { name, email, cpf, phone, birthDate, gender } = parsed as {
    name?: string;
    email?: string;
    cpf?: string;
    phone?: string;
    birthDate?: string | null;
    gender?: string | null;
  };

  // fetch current user
  const [currentUser] = await db.select().from(userTable).where(eq(userTable.id, userId));
  if (!currentUser) throw new Error('User not found');

  const updateData: Partial<typeof userTable.$inferInsert> = {};
  if (name) updateData.name = name;

  if (email && email !== currentUser.email) {
    // check email uniqueness
    const [existing] = await db.select().from(userTable).where(eq(userTable.email, email));
    if (existing && existing.id !== userId) throw new Error('Email already in use');
    updateData.email = email;
  }

  if (phone) updateData.phone = phone;
  if (birthDate !== undefined) updateData.birthDate = birthDate ? new Date(birthDate) : null;
  if (gender !== undefined) updateData.gender = gender;

  // CPF: allow to set only if not present yet on the user
  if (cpf) {
    if (currentUser.cpf) {
      throw new Error('CPF não pode ser alterado');
    }
    if (!isValidCPF(cpf)) {
      throw new Error('CPF inválido');
    }
    // check cpf uniqueness
    const [cpfExists] = await db.select().from(userTable).where(eq(userTable.cpf, cpf));
    if (cpfExists) throw new Error('CPF já cadastrado');
    updateData.cpf = cpf;
  }

  await db.update(userTable).set(updateData).where(eq(userTable.id, userId));

  const [user] = await db.select().from(userTable).where(eq(userTable.id, userId));

  return { user };
};
