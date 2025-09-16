import { deleteProduct } from "@/actions/products/delete";
import BackButton from '@/components/common/back-button';
import { Header } from '@/components/common/header';
import { db } from "@/db";
import { productTable } from "@/db/schema";
import Link from "next/link";

export default async function ProductsPage() {

  const products = await db.select().from(productTable).orderBy(productTable.createdAt).limit(50);

  return (
    <main className="p-8">
      <Header />
      <div className="flex items-center justify-between mb-6">
        <BackButton />
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link href="/dashboard/products/new" className="btn">
          Novo produto
        </Link>
      </div>

      <div className="space-y-4">
        {products.map((p) => (
          <div key={String(p.id)} className="p-4 border rounded flex items-center justify-between">
            <div>
              <h2 className="font-medium">{p.name}</h2>
              <p className="text-sm text-muted-foreground">{p.slug}</p>
            </div>
            <div className="space-x-2">
              <Link href={`/dashboard/products/${p.id}/edit`} className="btn">Editar</Link>
              <form action={async (formData: FormData) => {
                'use server'
                const id = String(formData.get('id'));
                await deleteProduct(id);
              }}>
                <input type="hidden" name="id" value={p.id} />
                <button type="submit" className="btn btn-danger">Remover</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
