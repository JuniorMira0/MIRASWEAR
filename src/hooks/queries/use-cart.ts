import { useQuery } from "@tanstack/react-query";

import { getCart } from "@/actions/get-cart";
import { getLocalCartProductData } from "@/actions/get-local-cart-product-data";
import { useLocalCart } from "@/hooks/use-local-cart";
import { authClient } from "@/lib/auth-client";

export const getUseCartQueryKey = (isLocal: boolean = false) =>
  isLocal ? (["cart", "local"] as const) : (["cart", "server"] as const);
export const getLocalCartQueryKey = () => ["localCart"] as const;

export const useCart = (params?: {
  initialData?: Awaited<ReturnType<typeof getCart>>;
}) => {
  const { data: session } = authClient.useSession();
  const localCart = useLocalCart();
  const isLocal = !session?.user;

  const serverCartQuery = useQuery({
    queryKey: getUseCartQueryKey(false),
    queryFn: getCart,
    initialData: params?.initialData,
    enabled: !!session?.user, // Só busca carrinho do servidor se logado
  });

  const localCartQuery = useQuery({
    queryKey: getUseCartQueryKey(true),
    queryFn: () => {
      if (localCart.items.length === 0) {
        return Promise.resolve([]);
      }
      return getLocalCartProductData(localCart.items);
    },
    enabled: !session?.user, // Sempre enabled para usuário local
    staleTime: 5 * 60 * 1000, // 5 minutos - dados dos produtos não mudam frequentemente
    gcTime: 10 * 60 * 1000, // 10 minutos de garbage collection
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
