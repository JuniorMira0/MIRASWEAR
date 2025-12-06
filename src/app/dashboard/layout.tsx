import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth-middleware';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();

  if (!admin) {
    redirect('/');
  }

  return <div>{children}</div>;
}
