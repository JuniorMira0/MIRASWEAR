"use client";

import { migrateLocalCartToServer } from "@/actions/migrate-local-cart";
import { getUseCartQueryKey } from "@/hooks/queries/use-cart";
import { useLocalCart } from "@/hooks/use-local-cart";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export const useCartMigration = () => {
  const { data: session } = authClient.useSession();
  const localCart = useLocalCart();
  const queryClient = useQueryClient();
  const previouslyLoggedIn = useRef(false);

  useEffect(() => {
    const isLoggedIn = !!session?.user;
    const wasLoggedOut = !previouslyLoggedIn.current;

    if (isLoggedIn && wasLoggedOut && localCart.items.length > 0) {
      const migrateCart = async () => {
        try {
          await migrateLocalCartToServer(localCart.items);
          localCart.clearCart();
          queryClient.invalidateQueries({
            queryKey: getUseCartQueryKey(false),
          });
          toast.success("Carrinho sincronizado com sua conta!");
        } catch (error) {
          console.error("Erro ao migrar carrinho:", error);
          toast.error("Erro ao sincronizar carrinho");
        }
      };

      migrateCart();
    }

    previouslyLoggedIn.current = isLoggedIn;
  }, [session?.user, localCart, queryClient]);
};
