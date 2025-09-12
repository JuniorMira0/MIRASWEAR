import { db } from "@/db";
import { productTable } from "@/db/schema";
import Link from "next/link";

export default async function ProductsPage() {

  const products = await db.select().from(productTable).orderBy(productTable.createdAt).limit(50);

  return (
    <main className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link href="/dashboard/products/new" className="btn">
          Novo produto
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <div key={String(p.id)} className="p-4 border rounded">
            <h2 className="font-medium">{p.name}</h2>
            <p className="text-sm text-muted-foreground">{p.slug}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
