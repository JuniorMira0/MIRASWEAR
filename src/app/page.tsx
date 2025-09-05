import { getCategories } from "@/actions/get-categories";
import BrandPartners from "@/components/common/brand-partners";
import ProductListClient from "@/components/common/product-list-client";
import PromoBanners from "@/components/common/promo-banners";
import { getProducts } from "@/data/products/get-products";
import Image from "next/image";
import { Header } from "../components/common/header";

export default async function Home() {
  const categories = await getCategories();
  const products = await getProducts();

  return (
    <>
      <Header categories={categories} />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-7xl space-y-10 px-2 py-6 md:px-11">
          <div className="overflow-hidden rounded-3xl">
            <Image
              src="/banner-01.png"
              alt="Leve uma vida com estilo"
              width={1200}
              height={600}
              sizes="100vw"
              className="h-[460px] w-full object-cover md:hidden"
              priority
            />
            <Image
              src="/banner-01-desk.png"
              alt="Leve uma vida com estilo"
              width={1800}
              height={700}
              sizes="100vw"
              className="hidden w-full object-cover md:block md:h-[420px] lg:h-[520px] xl:h-[600px]"
              priority
            />
          </div>

          <BrandPartners />

          <div className="">
            <ProductListClient
              title="Mais vendidos"
              type="best"
              initialProducts={products}
            />
          </div>

          <PromoBanners />

          <div className="flex flex-col gap-8 md:flex-row md:gap-6">
            <div className="md:w-2/3">
              <ProductListClient
                title="Novidades"
                type="new"
                initialProducts={products}
              />
            </div>
            <div className="flex items-center justify-center overflow-hidden rounded-3xl md:w-1/3">
              <Image
                src="/banner-02.png"
                alt="Leve uma vida com estilo"
                width={1200}
                height={700}
                sizes="100vw"
                className="h-[180px] w-full object-cover md:h-[420px] lg:h-[520px] xl:h-[600px]"
              />
            </div>
          </div>
        </div>
        
      </main>
    </>
  );
}
