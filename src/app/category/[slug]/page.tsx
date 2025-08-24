import { notFound } from "next/navigation";

import { getCategories, getCategoryBySlug } from "@/actions/get-categories";
import { Header } from "@/components/common/header";
import ProductItem from "@/components/common/product-item";
import { getProductsByCategory } from "@/data/products/get-products";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

const CategoryPage = async ({ params }: CategoryPageProps) => {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  const categories = await getCategories();

  if (!category) {
    return notFound();
  }
  const products = await getProductsByCategory(category.id);
  return (
    <>
  <Header categories={categories} />
      <div className="space-y-6 px-5">
        <h2 className="text-xl font-semibold">{category.name}</h2>
        <div className="grid grid-cols-2 gap-4">
          {products.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              textContainerClassName="max-w-full"
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default CategoryPage;
