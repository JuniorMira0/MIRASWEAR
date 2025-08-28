"use client";
import ProductList from "@/components/common/product-list";
import { useQuery } from "@tanstack/react-query";

interface ProductListClientProps {
  title: string;
  type?: "best" | "new";
}

export default function ProductListClient({
  title,
  type = "best",
}: ProductListClientProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["products-home"],
    queryFn: async () => {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error("Erro ao buscar produtos");
      return res.json();
    },
    refetchInterval: 5000,
  });

  let products = [];
  if (type === "best") {
    products = data?.products ?? [];
  } else if (type === "new") {
    products = data?.newlyAddedProducts ?? [];
  }

  return (
    <ProductList title={title} products={products} isLoading={isLoading} />
  );
}
