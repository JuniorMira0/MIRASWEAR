"use server";
import { getCategories } from "@/actions/get-categories";
import BrandPartners from "@/components/common/brand-partners";
import Footer from "@/components/common/footer";
import ProductList from "@/components/common/product-list";
import PromoBanners from "@/components/common/promo-banners";
import { getProducts, getRecentProducts } from "@/data/products/get-products";
import Image from "next/image";
import { Header } from "../components/common/header";

export default async function Home() {
  const products = await getProducts();
  const newlyAddedProducts = await getRecentProducts();
  const categories = await getCategories();
  return (
    <>
      <Header categories={categories} />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-7xl space-y-10 px-2 py-6 md:px-11">
          <div className="overflow-hidden rounded-3xl">
            <Image
              src="/banner-01.png"
              alt="Leve uma vida com estilo"
              height={0}
              width={0}
              sizes="100vw"
              className="h-[460px] w-full object-cover md:hidden"
            />
            <Image
              src="/banner-01-desk.png"
              alt="Leve uma vida com estilo"
              height={0}
              width={0}
              sizes="100vw"
              className="hidden w-full object-cover md:block md:h-[420px] lg:h-[520px] xl:h-[600px]"
            />
          </div>

          <BrandPartners />

          <div className="">
            <ProductList title="Mais vendidos" products={products} />
          </div>

          <PromoBanners />

          <div className="flex flex-col gap-8 md:flex-row md:gap-6">
            <div className="md:w-2/3">
              <ProductList title="Novidades" products={newlyAddedProducts} />
            </div>
            <div className="flex items-center justify-center overflow-hidden rounded-3xl md:w-1/3">
              <Image
                src="/banner-02.png"
                alt="Leve uma vida com estilo"
                height={0}
                width={0}
                sizes="100vw"
                className="h-[180px] w-full object-cover md:h-[420px] lg:h-[520px] xl:h-[600px]"
              />
            </div>
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
