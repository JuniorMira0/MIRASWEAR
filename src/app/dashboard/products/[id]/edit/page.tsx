import { updateProduct } from '@/actions/products/update';
import ProductForm from '@/app/dashboard/products/_form';
import ActiveCheckbox from '@/components/common/active-checkbox';
import BackButton from '@/components/common/back-button';
import { Header } from '@/components/common/header';
import { db } from '@/db';
import { categoryTable } from '@/db/schema';

type Props = { params: { id: string } };

export default async function EditProductPage({ params }: Props) {
  const prod = await db.query.productTable.findFirst({
    where: (t, { eq }) => eq(t.id, params.id),
  });
  if (!prod) return <div>Produto não encontrado</div>;

  const variants = await db.query.productVariantTable.findMany({
    where: (t, { eq }) => eq(t.productId, params.id),
  });

  const variantIds = variants.map(v => v.id);
  const inventory = await db.query.inventoryItemTable.findMany({
    where: (t, { inArray }) => inArray(t.productVariantId, variantIds),
  });
  const sizes = await db.query.productVariantSizeTable.findMany({
    where: (t, { inArray }) => inArray(t.productVariantId, variantIds),
  });

  const onSubmit = async (formData: FormData) => {
    'use server';
    const id = formData.get('id') as string;
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const description = formData.get('description') as string;
    const categoryId = (formData.get('categoryId') as string) || undefined;
    const variantsJson = String(formData.get('variantsJson') || '[]');
    const variants = JSON.parse(variantsJson);

    await updateProduct({ id, name, slug, description, categoryId, variants });
  };

  const categories = await db
    .select()
    .from(categoryTable)
    .orderBy(categoryTable.createdAt)
    .limit(200);

  return (
    <main className="p-8">
      <Header />
      <header className="mb-6 flex items-center justify-between">
        <BackButton />
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Editar produto</h1>
          <ActiveCheckbox id={prod.id} initial={prod.isActive ?? true} />
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
            variants: variants.map(v => {
              const vSizes = sizes
                .filter(s => s.productVariantId === v.id)
                .map(s => ({ id: s.id, size: s.size }));
              if (vSizes.length > 0) {
                const sizesWithQty = vSizes.map(s => ({
                  size: s.size,
                  quantity: inventory.find(i => i.productVariantSizeId === s.id)?.quantity ?? 0,
                }));
                return {
                  id: v.id,
                  name: v.name,
                  slug: v.slug,
                  color: v.color,
                  priceInCents: v.priceInCents,
                  imageUrl: v.imageUrl,
                  sizes: sizesWithQty,
                };
              }
              const inv = inventory.find(
                i => i.productVariantId === v.id && !i.productVariantSizeId,
              );
              return {
                id: v.id,
                name: v.name,
                slug: v.slug,
                color: v.color,
                priceInCents: v.priceInCents,
                imageUrl: v.imageUrl,
                stock: inv?.quantity ?? 0,
              };
            }),
          },
          onSubmit,
          categories,
        } as any)}
      />
    </main>
  );
}
