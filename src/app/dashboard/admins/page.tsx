import Link from 'next/link';

import { db } from '@/db';
import { userTable } from '@/db/schema';
import { requireAdmin } from '@/lib/auth-middleware';

export default async function AdminsPage() {
  await requireAdmin();

  const users = await db.select().from(userTable).orderBy(userTable.createdAt).limit(200);

  return (
    <main className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Administradores</h1>
        <Link href="/dashboard" className="btn">
          Voltar
        </Link>
      </div>

      <div className="space-y-2">
        {users.map(u => (
          <div key={String(u.id)} className="flex items-center justify-between rounded border p-3">
            <div>
              <div className="font-medium">{u.name || u.email}</div>
              <div className="text-muted-foreground text-sm">{u.email}</div>
            </div>
            <div>
              <form
                action={async (formData: FormData) => {
                  'use server';
                  const id = formData.get('id') as string;
                  const makeAdmin = formData.get('makeAdmin') === 'true';
                  const { toggleAdmin } = await import('@/actions/admins/toggle-admin');
                  await toggleAdmin(id, makeAdmin);
                }}
              >
                <input type="hidden" name="id" value={u.id} />
                <input type="hidden" name="makeAdmin" value={!u.isAdmin ? 'true' : 'false'} />
                <button type="submit" className="btn">
                  {u.isAdmin ? 'Remover admin' : 'Tornar admin'}
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
