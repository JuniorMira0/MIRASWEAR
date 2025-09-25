import { createProduct } from '@/actions/products/create';
import ProductForm from '@/app/dashboard/products/_form';
import { db } from '@/db';
import { categoryTable } from '@/db/schema';

export default async function NewProductPage() {
  const categories = await db
    .select()
    .from(categoryTable)
    .orderBy(categoryTable.createdAt)
    .limit(200);

  const onSubmit = async (formData: FormData) => {
    'use server';
    const name = String(formData.get('name') || '');
    const slug = String(formData.get('slug') || '');
    const description = String(formData.get('description') || '');
    const categoryId = String(formData.get('categoryId') || '') || undefined;
    const variantsJson = String(formData.get('variantsJson') || '[]');
    const variants = JSON.parse(variantsJson);

    await createProduct({ name, slug, description, categoryId, variants });
  };

  return (
    <main className="p-8">
      <h1 className="mb-4 text-2xl font-semibold">Novo produto</h1>
      <ProductForm {...({ categories, onSubmit } as any)} />
    </main>
  );
}
