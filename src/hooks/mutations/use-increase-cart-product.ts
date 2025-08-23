import { getCart } from "@/actions/get-cart";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addProductToCart } from "@/actions/add-cart-product";

import { getUseCartQueryKey } from "../queries/use-cart";

export const getIncreaseCartProductMutationKey = (
  productVariantId: string,
  productVariantSizeId?: string | null,
) =>
  [
    "increase-cart-product-quantity",
    productVariantId,
    productVariantSizeId ?? "no-size",
  ] as const;

export const useIncreaseCartProduct = (
  productVariantId: string,
  productVariantSizeId?: string | null,
) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getIncreaseCartProductMutationKey(
      productVariantId,
      productVariantSizeId,
    ),
    mutationFn: () =>
      addProductToCart({
        productVariantId,
        quantity: 1,
        productVariantSizeId: productVariantSizeId ?? undefined,
      }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: getUseCartQueryKey() });
      const prev =
        queryClient.getQueryData<Awaited<ReturnType<typeof getCart>>>(
          getUseCartQueryKey(),
        );
      if (prev) {
        const existing = prev.items.find(
          (i) => i.productVariantId === productVariantId,
        );
        if (existing) {
          const optimistic = {
            ...prev,
            items: prev.items.map((i) =>
              i.id === existing.id ? { ...i, quantity: i.quantity + 1 } : i,
            ),
            totalPriceInCents:
              prev.totalPriceInCents + existing.productVariant.priceInCents,
          } as typeof prev;
          queryClient.setQueryData(getUseCartQueryKey(), optimistic);
        }
      }
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(getUseCartQueryKey(), ctx.prev);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
};
