import { useQuery } from "@tanstack/react-query";

import { getCart } from "@/actions/get-cart";
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
    queryFn: () => Promise.resolve([]), // Não precisa mais buscar dados
    enabled: false, // Desabilitada pois dados vêm direto do localStorage
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  // Se usuário não está logado, retorna dados do carrinho local
  if (!session?.user) {
    // Cria dados diretamente do localStorage, sem precisar de query
    const localCartData =
      localCart.items.length > 0
        ? {
            id: "local",
            userId: "local",
            shippingAddressId: null,
            createdAt: new Date(),
            shippingAddress: null,
            items: localCart.items.map((item) => ({
              id: `local-${item.productVariantId}`,
              cartId: "local",
              productVariantId: item.productVariantId,
              quantity: item.quantity,
              productVariant: {
                id: item.productVariantId,
                name: item.productVariantName || "Produto",
                imageUrl: item.productVariantImageUrl || "/logo.png",
                priceInCents: item.productVariantPriceInCents || 0,
                product: {
                  id: "local-product",
                  name: item.productName || "Produto",
                },
              },
            })),
          }
        : null;

    return {
      ...localCartQuery,
      data: localCartData,
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
