import { getCategories } from "@/actions/get-categories";
import CategorySelector from "@/components/common/category-selector";
import Footer from "@/components/common/footer";
import ProductList from "@/components/common/product-list";
import { getProducts, getRecentProducts } from "@/data/products/get-products";
import Image from "next/image";
import { Header } from "../components/common/header";

const Home = async () => {
  const products = await getProducts();
  const newlyAddedProducts = await getRecentProducts();

  const categories = await getCategories();
  return (
    <>
      <Header />

      <div className="space-y-6">
        <div className="px-5">
          <Image
            src="/banner-01.png"
            alt="Leve uma vida com estilo"
            height={0}
            width={0}
            sizes="100vw"
            className="h-auto w-full"
          />
        </div>

        <ProductList title="Produtos em destaque" products={products} />

        <div className="px-5">
          <CategorySelector categories={categories} />
        </div>

        <div className="px-5">
          <Image
            src="/banner-02.png"
            alt="Leve uma vida com estilo"
            height={0}
            width={0}
            sizes="100vw"
            className="h-auto w-full"
          />
        </div>
        <ProductList title="Novidades" products={newlyAddedProducts} />
        <Footer />
      </div>
    </>
  );
};

export default Home;
