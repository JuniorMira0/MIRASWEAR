"use client";

import type { LocalCartItem } from "@/actions/get-local-cart-product-data";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

const LOCAL_CART_KEY = "miraswear-cart";

export const useLocalCart = () => {
  const [items, setItems] = useState<LocalCartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem(LOCAL_CART_KEY);
      if (savedCart) {
        try {
          setItems(JSON.parse(savedCart));
        } catch (error) {
          console.error("Erro ao carregar carrinho local:", error);
          localStorage.removeItem(LOCAL_CART_KEY);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
      queryClient.refetchQueries({
        queryKey: ["cart", "local"],
        type: "active",
      });
    }
  }, [items, queryClient, isLoaded]);

  const addItem = (productVariantId: string, quantity: number) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) => item.productVariantId === productVariantId,
      );

      if (existingItem) {
        return prev.map((item) =>
          item.productVariantId === productVariantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }

      return [...prev, { productVariantId, quantity }];
    });
  };

  const removeItem = (productVariantId: string) => {
    setItems((prev) =>
      prev.filter((item) => item.productVariantId !== productVariantId),
    );
  };

  const decreaseQuantity = (productVariantId: string) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.productVariantId === productVariantId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const clearCart = () => {
    setItems([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_CART_KEY);
    }
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    items,
    addItem,
    removeItem,
    decreaseQuantity,
    clearCart,
    getTotalItems,
  };
};
