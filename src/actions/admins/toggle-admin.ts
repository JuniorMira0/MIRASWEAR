'use server';

import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { userTable } from '@/db/schema';
import { requireAdmin } from '@/lib/auth-middleware';

export async function toggleAdmin(userId: string, makeAdmin: boolean) {
  await requireAdmin(); // only admins can toggle

  await db.update(userTable).set({ isAdmin: makeAdmin }).where(eq(userTable.id, userId));

  return true;
}
