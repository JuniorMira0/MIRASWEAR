import { getCategories } from '@/actions/get-categories';
import { deleteProduct } from "@/actions/products/delete";
import BackButton from '@/components/common/back-button';
import { Header } from '@/components/common/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { db } from "@/db";
import { productTable } from "@/db/schema";
import { eq } from 'drizzle-orm';
import Link from "next/link";

export default async function ProductsPage() {

  const categories = await getCategories();

  // fetch products grouped by category
  const productsByCategory = {} as Record<string, Awaited<ReturnType<typeof db.query.productTable.findMany>>>;
  for (const cat of categories) {
    const prods = await db
      .select()
      .from(productTable)
      .where(eq(productTable.categoryId, cat.id))
      .orderBy(productTable.createdAt);
    productsByCategory[cat.id] = prods;
  }

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
        {categories.map((cat) => (
          <Accordion key={String(cat.id)} type="single" collapsible>
            <AccordionItem value={String(cat.id)}>
              <div className="p-4 border rounded">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{cat.name}</h2>
                    <p className="text-sm text-muted-foreground">{cat.slug}</p>
                  </div>
                  <div>
                    <AccordionTrigger>Ver produtos</AccordionTrigger>
                  </div>
                </div>

                <AccordionContent>
                  <div className="mt-4 space-y-3">
                    {(productsByCategory[cat.id] || []).map((p) => (
                      <div key={String(p.id)} className="p-3 border rounded flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{p.name}</h3>
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
                </AccordionContent>
              </div>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
    </main>
  );
}
