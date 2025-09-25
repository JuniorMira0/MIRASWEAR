import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';

import { db } from '@/db';
import { userTable } from '@/db/schema';
import { auth } from '@/lib/auth';

export const requireAuth = async (): Promise<string> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error('Unauthorized: User must be logged in');
  }

  return session.user.id;
};

export const requireAdmin = async (): Promise<{
  id: string;
  email: string;
} | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const userId = session.user.id;

  const rows = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);
  const user = rows[0];

  if (!user) return null;

  if (user.isAdmin) {
    return { id: user.id, email: user.email };
  }

  return null;
};
