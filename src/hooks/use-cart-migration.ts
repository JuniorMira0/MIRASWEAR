"use client";

import { migrateLocalCartToServer } from "@/actions/migrate-local-cart";
import { useCartStore } from "@/hooks/cart-store";
import { getUseCartQueryKey } from "@/hooks/queries/use-cart";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const useCartMigration = () => {
  const { data: session } = authClient.useSession();
  const { state, clear } = useCartStore();
  const queryClient = useQueryClient();
  const previouslyLoggedIn = useRef(false);

  useEffect(() => {
    const isLoggedIn = !!session?.user;
    const wasLoggedOut = !previouslyLoggedIn.current;

    if (isLoggedIn && wasLoggedOut && state.items.length > 0) {
      (async () => {
        try {
          const result = await migrateLocalCartToServer(
            state.items.map((i) => ({
              productVariantId: i.productVariantId,
              quantity: i.quantity,
              productName: i.productName,
              productVariantName: i.productVariantName,
              productVariantImageUrl: i.productVariantImageUrl,
              productVariantPriceInCents: i.productVariantPriceInCents,
              productVariantSizeId: i.productVariantSizeId ?? null,
              sizeLabel: i.sizeLabel ?? null,
            })),
          );
          if (result.ok) {
            clear();
            queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
            toast.success("Carrinho sincronizado com sua conta!");
          } else {
            console.error("Falha ao migrar carrinho:", result.error);
            toast.error("Erro ao sincronizar carrinho");
          }
        } catch (e) {
          console.error("Erro ao migrar carrinho", e);
          toast.error("Erro ao sincronizar carrinho");
        }
      })();
    }

    previouslyLoggedIn.current = isLoggedIn;
  }, [session?.user, state.items, clear, queryClient]);
};
