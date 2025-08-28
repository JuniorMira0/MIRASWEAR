"use client";
import ProductList from "@/components/common/product-list";
import { useQuery } from "@tanstack/react-query";

interface ProductListClientProps {
  title: string;
  type?: "best" | "new";
  initialProducts?: any[];
}

export default function ProductListClient(props: ProductListClientProps) {
  const { title, type = "best", initialProducts = [] } = props;

  const { data, isLoading } = useQuery({
    queryKey: ["products-home"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Erro ao buscar produtos");
      return res.json();
    },
    refetchInterval: 5000,
    initialData: {
      products: initialProducts,
      newlyAddedProducts: initialProducts,
    },
  });

  let products = [];
  if (type === "best") {
    products = data?.products ?? initialProducts;
  } else if (type === "new") {
    products = data?.newlyAddedProducts ?? initialProducts;
  }

  return (
    <ProductList title={title} products={products} isLoading={isLoading} />
  );
}
