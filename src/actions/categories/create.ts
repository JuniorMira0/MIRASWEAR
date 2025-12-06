'use server';

import { db } from '@/db';
import { categoryTable } from '@/db/schema';
import { requireAdmin } from '@/lib/auth-middleware';

export async function createCategory(name: string, slug: string) {
  if (!name) throw new Error('Nome da categoria é obrigatório');
  await requireAdmin();

  const [created] = await db
    .insert(categoryTable)
    .values({ name, slug } as any)
    .returning();
  return created;
}
