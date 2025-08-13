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
    enabled: !!session?.user,
  });

  const localCartQuery = useQuery({
    queryKey: getUseCartQueryKey(true),
    queryFn: () => {
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
      return Promise.resolve(localCartData);
    },
    enabled: !session?.user,
    staleTime: 0,
    gcTime: 0,
  });

  if (!session?.user) {
    return {
      ...localCartQuery,
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
    localItems: [],
  };
};
