import { updateProduct } from "@/actions/products/update";
import ProductForm from "@/app/dashboard/products/_form";
import BackButton from '@/components/common/back-button';
import { Header } from '@/components/common/header';
import { db } from "@/db";
import { redirect, useRouter } from "next/navigation";
import { useState } from 'react';

type Props = { params: { id: string } };

export default async function EditProductPage({ params }: Props) {
  const prod = await db.query.productTable.findFirst({ where: (t, { eq }) => eq(t.id, params.id) });
  if (!prod) return <div>Produto não encontrado</div>;

  const variants = await db.query.productVariantTable.findMany({ where: (t, { eq }) => eq(t.productId, params.id) });

  const variantIds = variants.map((v) => v.id);
  const inventory = await db.query.inventoryItemTable.findMany({ where: (t, { inArray }) => inArray(t.productVariantId, variantIds) });
  const sizes = await db.query.productVariantSizeTable.findMany({ where: (t, { inArray }) => inArray(t.productVariantId, variantIds) });

  const onSubmit = async (formData: FormData) => {
    'use server'
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const categoryId = (formData.get('categoryId') as string) || undefined;

    await updateProduct({ id, name, slug, description, categoryId });
    redirect('/dashboard/products');
  };

  return (
    <main className="p-8">
      <Header />
      <header className="mb-6 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Editar produto</h1>
          <DeleteProductButton id={prod.id} />
        </div>
      </header>
      <ProductForm
        {...({
          initial: {
            id: prod.id,
            name: prod.name,
            slug: prod.slug,
            description: prod.description,
            categoryId: prod.categoryId,
            variants: variants.map((v) => {
              const vSizes = sizes.filter((s) => s.productVariantId === v.id).map((s) => ({ id: s.id, size: s.size }));
              if (vSizes.length > 0) {
                const sizesWithQty = vSizes.map((s) => ({ size: s.size, quantity: inventory.find((i) => i.productVariantSizeId === s.id)?.quantity ?? 0 }));
                return { id: v.id, name: v.name, slug: v.slug, color: v.color, priceInCents: v.priceInCents, imageUrl: v.imageUrl, sizes: sizesWithQty };
              }
              const inv = inventory.find((i) => i.productVariantId === v.id && !i.productVariantSizeId);
              return { id: v.id, name: v.name, slug: v.slug, color: v.color, priceInCents: v.priceInCents, imageUrl: v.imageUrl, stock: inv?.quantity ?? 0 };
            }),
          },
          onSubmit,
        } as any)}
      />
    </main>
  );
}

function DeleteProductButtonClient(props: { id: string }) {
  'use client';
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="ml-3 text-sm text-red-600 hover:underline"
      disabled={loading}
      onClick={async () => {
        if (!confirm('Tem certeza que deseja remover este produto? Esta ação é irreversível.')) return;
        setLoading(true);
        try {
          const res = await fetch('/api/admin/delete-product', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: props.id }) });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao remover produto');
          router.push('/dashboard/products');
        } catch (err) {
          const msg = (err as any)?.message ?? String(err);
          alert(`Erro ao remover produto: ${msg}`);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? 'Removendo...' : 'Remover produto'}
    </button>
  );
}

function DeleteProductButton(props: { id: string }) {
  return <DeleteProductButtonClient id={props.id} />;
}
