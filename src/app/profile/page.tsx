import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';

import { getCategories } from '@/actions/get-categories';
import { Header } from '@/components/common/header';
import { db } from '@/db';
import { userTable } from '@/db/schema';
import { requireAuth } from '@/lib/auth-middleware';

import ProfileShell from './components/shell';

const ProfilePage = async () => {
  const categories = await getCategories();

  let user = null;
  let userId: string | null = null;

  try {
    userId = await requireAuth();
  } catch (err) {
    redirect(`/authentication?redirect=/profile`);
  }

  if (userId) {
    const [row] = await db.select().from(userTable).where(eq(userTable.id, userId));
    if (row) {
      user = {
        id: row.id,
        name: row.name,
        email: row.email,
        cpf: row.cpf ?? null,
        phone: row.phone ?? null,
        birthDate: row.birthDate ? row.birthDate.toISOString() : null,
        gender: row.gender ?? null,
      };
    }
  }

  return (
    <>
      <Header categories={categories} />
      <ProfileShell user={user} />
    </>
  );
};

export default ProfilePage;
