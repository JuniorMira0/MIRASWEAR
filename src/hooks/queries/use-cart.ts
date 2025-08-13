import { useQuery } from "@tanstack/react-query";

import { getCart } from "@/actions/get-cart";
import { getLocalCartItems } from "@/data/cart/get-local-cart-items";
import { useLocalCart } from "@/hooks/use-local-cart";
import { authClient } from "@/lib/auth-client";

export const getUseCartQueryKey = () => ["cart"] as const;
export const getLocalCartQueryKey = () => ["localCart"] as const;

export const useCart = (params?: {
  initialData?: Awaited<ReturnType<typeof getCart>>;
}) => {
  const { data: session } = authClient.useSession();
  const localCart = useLocalCart();

  const serverCartQuery = useQuery({
    queryKey: getUseCartQueryKey(),
    queryFn: getCart,
    initialData: params?.initialData,
    enabled: !!session?.user, // Só busca carrinho do servidor se logado
  });

  const localCartQuery = useQuery({
    queryKey: [...getLocalCartQueryKey(), localCart.items],
    queryFn: () => getLocalCartItems(localCart.items),
    enabled: !session?.user && localCart.items.length > 0,
  });

  // Se usuário não está logado, retorna dados do carrinho local
  if (!session?.user) {
    return {
      ...localCartQuery,
      data: localCartQuery.data
        ? {
            id: "local",
            userId: "local",
            shippingAddressId: null,
            createdAt: new Date(),
            shippingAddress: null,
            items: localCartQuery.data,
          }
        : null,
      // Métodos para manipular carrinho local
      addItem: localCart.addItem,
      removeItem: localCart.removeItem,
      decreaseQuantity: localCart.decreaseQuantity,
      clearCart: localCart.clearCart,
      getTotalItems: localCart.getTotalItems,
      localItems: localCart.items,
    };
  }

  return {
    ...serverCartQuery,
    // Para usuários logados, usar server actions
    localItems: [],
  };
};
