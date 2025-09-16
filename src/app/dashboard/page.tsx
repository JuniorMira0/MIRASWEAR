import BackButton from '@/components/common/back-button';
import { Header } from '@/components/common/header';
import { requireAdmin } from "@/lib/auth-middleware";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const admin = await requireAdmin();

  if (!admin) {
    redirect("/");
  }

  return (
    <main className="p-8">
      <Header />
      <div className="mb-6 flex items-center justify-between">
        <BackButton />
        <h1 className="text-3xl font-bold">Dashboard Admin</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/products"
          className="p-6 border rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">Products</h2>
          <p className="text-sm text-muted-foreground">Gerencie produtos</p>
        </Link>

        <Link
          href="/dashboard/orders"
          className="p-6 border rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">Orders</h2>
          <p className="text-sm text-muted-foreground">Veja e gerencie pedidos</p>
        </Link>

        <Link
          href="/dashboard/reports"
          className="p-6 border rounded-lg hover:shadow-md transition"
        >
          <h2 className="text-xl font-semibold">Reports</h2>
          <p className="text-sm text-muted-foreground">Relatórios de vendas</p>
        </Link>
      </div>
    </main>
  );
}
