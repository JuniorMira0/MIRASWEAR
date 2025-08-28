"use client";

import { productTable, productVariantTable } from "@/db/schema";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import ProductItem from "./product-item";

interface ProductListProps {
  title: string;
  products: (typeof productTable.$inferSelect & {
    variants: (typeof productVariantTable.$inferSelect & {
      inventoryItems?: { quantity: number }[];
    })[];
  })[];
  isLoading?: boolean;
}

const SCROLL_AMOUNT = 600;

const ProductList = ({ title, products, isLoading }: ProductListProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 0);
    setCanRight(el.scrollWidth - el.clientWidth - el.scrollLeft > 5);
  }, []);

  useEffect(() => {
    update();
    const el = scrollRef.current;
    if (!el) return;
    const onScroll = () => update();
    el.addEventListener("scroll", onScroll, { passive: true });
    const onResize = () => update();
    window.addEventListener("resize", onResize);

    return () => {
      el.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [update]);

  useEffect(() => {
    if (!isLoading) {
      const el = scrollRef.current;
      if (el) el.scrollLeft = 0;
      const timeout = setTimeout(() => {
        update();
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isLoading, products, update]);

  const scrollByAmount = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: "smooth" });
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      scrollByAmount(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      scrollByAmount(-1);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const isAOut = a.variants.every((v) => {
      if (!v.inventoryItems || v.inventoryItems.length === 0) return true;
      return (
        v.inventoryItems.reduce(
          (sum: number, item: { quantity: number }) =>
            sum + (item.quantity ?? 0),
          0,
        ) <= 0
      );
    });
    const isBOut = b.variants.every((v) => {
      if (!v.inventoryItems || v.inventoryItems.length === 0) return true;
      return (
        v.inventoryItems.reduce(
          (sum: number, item: { quantity: number }) =>
            sum + (item.quantity ?? 0),
          0,
        ) <= 0
      );
    });
    if (isAOut === isBOut) return 0;
    return isAOut ? 1 : -1;
  });

  return (
    <div className="space-y-6">
      <h3 className="px-5 font-semibold md:px-11">{title}</h3>
      <div className="relative">
        {isLoading ? (
          <div className="text-muted-foreground flex items-center justify-center py-10">
            Carregando...
          </div>
        ) : (
          <div
            ref={scrollRef}
            tabIndex={0}
            onKeyDown={onKeyDown}
            aria-label={`Lista de produtos: ${title}`}
            className="flex w-full snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-5 md:gap-3 md:px-11 [&::-webkit-scrollbar]:hidden"
          >
            {sortedProducts.map((product) => (
              <div
                key={product.id}
                className="min-w-[140px] snap-start md:min-w-[168px] lg:min-w-[180px]"
                aria-label={product.name}
              >
                <ProductItem product={product} />
              </div>
            ))}
          </div>
        )}

        <div className="from-background pointer-events-none absolute inset-y-0 left-0 hidden w-8 bg-gradient-to-r to-transparent md:block" />
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 hidden w-8 bg-gradient-to-l to-transparent md:block" />

        <button
          type="button"
          aria-label="Scroll esquerda"
          onClick={() => scrollByAmount(-1)}
          disabled={!canLeft}
          className="bg-background/80 text-foreground ring-border hover:bg-background focus-visible:ring-primary absolute top-1/2 left-2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow backdrop-blur transition disabled:opacity-30 md:flex"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          aria-label="Scroll direita"
          onClick={() => scrollByAmount(1)}
          disabled={!canRight}
          className="bg-background/80 text-foreground ring-border hover:bg-background focus-visible:ring-primary absolute top-1/2 right-2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border shadow backdrop-blur transition disabled:opacity-30 md:flex"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ProductList;
