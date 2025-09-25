import { eq } from 'drizzle-orm';
import Link from 'next/link';

import { getCategories } from '@/actions/get-categories';
import BackButton from '@/components/common/back-button';
import { Header } from '@/components/common/header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { db } from '@/db';
import { productTable } from '@/db/schema';

type ProductWithImage = {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
};

export default async function ProductsPage() {
  const categories = await getCategories();

  const productsByCategory: Record<string, ProductWithImage[]> = {};
  for (const cat of categories) {
    const prods = await db
      .select()
      .from(productTable)
      .where(eq(productTable.categoryId, cat.id))
      .orderBy(productTable.createdAt);

    const prodIds = prods.map(p => p.id);
    let variants: Array<{
      productId: string;
      imageUrl: string;
      createdAt?: Date;
    }> = [];
    if (prodIds.length) {
      const rows = await db.query.productVariantTable.findMany({
        where: (pv, { inArray }) => inArray(pv.productId, prodIds),
        orderBy: (pv, { asc }) => asc(pv.createdAt),
      });

      const map = new Map<string, string>();
      for (const r of rows as any) {
        if (!map.has(r.productId)) map.set(r.productId, r.imageUrl);
      }
      variants = Array.from(map.entries()).map(([productId, imageUrl]) => ({
        productId,
        imageUrl,
      }));
    }

    productsByCategory[cat.id] = prods.map(p => {
      const found = variants.find(v => v.productId === p.id);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        imageUrl: found?.imageUrl ?? null,
      };
    });
  }

  return (
    <main className="p-8">
      <Header />
      <div className="mb-6 flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <Link href="/dashboard/products/new" className="btn">
          Novo produto
        </Link>
      </div>

      <div className="space-y-4">
        {categories.map(cat => (
          <Accordion key={String(cat.id)} type="single" collapsible>
            <AccordionItem value={String(cat.id)}>
              <div className="rounded border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{cat.name}</h2>
                    <p className="text-muted-foreground text-sm">{cat.slug}</p>
                  </div>
                  <div>
                    <AccordionTrigger>Ver produtos</AccordionTrigger>
                  </div>
                </div>

                <AccordionContent>
                  <div className="mt-4 space-y-3">
                    {(productsByCategory[cat.id] || []).map(p => (
                      <div
                        key={String(p.id)}
                        className="flex items-center justify-between rounded border p-3"
                      >
                        <div className="flex items-center gap-4">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.name}
                              className="h-16 w-16 rounded object-cover"
                            />
                          ) : (
                            <div className="bg-muted h-16 w-16 rounded" />
                          )}
                          <div>
                            <h3 className="font-medium">{p.name}</h3>
                            <p className="text-muted-foreground text-sm">{p.slug}</p>
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Link href={`/dashboard/products/${p.id}/edit`} className="btn">
                            Editar
                          </Link>
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
