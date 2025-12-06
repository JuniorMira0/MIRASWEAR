import { useMutation, useQueryClient } from '@tanstack/react-query';

import { decreaseCartProductQuantity } from '@/actions/decrease-cart-product-quantity';
import { getCart } from '@/actions/get-cart';

import { getUseCartQueryKey } from '../queries/use-cart';

const getDecreaseCartProductQuantityMutationKey = (cartItemId: string) =>
  ['decrease-cart-product-quantity', cartItemId] as const;

export const useDecreaseCartProductQuantity = (cartItemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getDecreaseCartProductQuantityMutationKey(cartItemId),
    mutationFn: () => decreaseCartProductQuantity({ cartItemId }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: getUseCartQueryKey() });
      const prev =
        queryClient.getQueryData<Awaited<ReturnType<typeof getCart>>>(getUseCartQueryKey());
      if (prev) {
        const existing = prev.items.find(i => i.id === cartItemId);
        if (existing) {
          const optimisticQty = existing.quantity - 1;
          const optimistic = {
            ...prev,
            items: prev.items
              .map(i => (i.id === existing.id ? { ...i, quantity: optimisticQty } : i))
              .filter(i => i.quantity > 0),
            totalPriceInCents: prev.totalPriceInCents - existing.productVariant.priceInCents,
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
