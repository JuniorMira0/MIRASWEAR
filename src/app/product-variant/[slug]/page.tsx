import { notFound } from "next/navigation";

import { getCategories } from "@/actions/get-categories";
import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import ProductList from "@/components/common/product-list";
import {
  getLikelyProducts,
  getProductVariantBySlug,
} from "@/data/products/get-product-variant";
import { formatCentsToBRL } from "@/helpers/money";

import ProductImageGallery from "@/app/product-variant/[slug]/components/product-image-gallery";
import ProductActions from "./components/product-actions";
import VariantSelector from "./components/variant-selector";

interface ProductVariantPageProps {
  params: Promise<{ slug: string }>;
}

const ProductVariantPage = async ({ params }: ProductVariantPageProps) => {
  const { slug } = await params;
  const productVariant = await getProductVariantBySlug(slug);
  const categories = await getCategories();

  if (!productVariant) {
    return notFound();
  }

  const likelyProducts = await getLikelyProducts(
    productVariant.product.categoryId,
    productVariant.product.id,
  );
  const hasMultipleVariants = productVariant.product.variants.length > 1;
  const sizes = (productVariant.sizes ?? []).map((s) => ({
    id: s.id,
    size: s.size,
  }));
  return (
    <>
      <Header categories={categories} />
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:grid lg:grid-cols-12 lg:gap-8">
        {/* LEFT: Gallery */}
        <div className="lg:col-span-7">
          <ProductImageGallery
            imageUrl={productVariant.imageUrl}
            alt={productVariant.name}
          />
          {hasMultipleVariants && (
            <div className="mt-4 md:hidden">
              <VariantSelector
                selectedVariantSlug={productVariant.slug}
                variants={productVariant.product.variants}
              />
            </div>
          )}
        </div>

        <div className="lg:col-span-5 lg:pr-2">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-semibold">
                {productVariant.product.name}
              </h1>
              <p className="text-muted-foreground text-sm">
                {productVariant.name}
              </p>
              <p className="mt-1 text-xl font-semibold">
                {formatCentsToBRL(productVariant.priceInCents)}
              </p>
            </div>

            {hasMultipleVariants && (
              <div className="hidden md:block">
                <VariantSelector
                  selectedVariantSlug={productVariant.slug}
                  variants={productVariant.product.variants}
                />
              </div>
            )}
            <ProductActions
              productVariantId={productVariant.id}
              sizes={sizes}
            />

            {/* Description */}
            <div>
              <p>{productVariant.product.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 pb-10">
        <ProductList
          title="Você também pode gostar"
          products={likelyProducts}
        />
      </div>

      <Footer />
    </>
  );
};
export default ProductVariantPage;
