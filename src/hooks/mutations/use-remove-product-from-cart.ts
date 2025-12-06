import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getCart } from '@/actions/get-cart';
import { removeProductFromCart } from '@/actions/remove-cart-product';
import { TOAST_MESSAGES } from '@/constants/toast-messages';

import { getUseCartQueryKey } from '../queries/use-cart';

export const getRemoveCartProductMutationKey = (cartItemId: string) =>
  ['remove-cart-product', cartItemId] as const;

export const useRemoveProductFromCart = (cartItemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getRemoveCartProductMutationKey(cartItemId),
    mutationFn: () => removeProductFromCart({ cartItemId }),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: getUseCartQueryKey() });

      const prev =
        queryClient.getQueryData<Awaited<ReturnType<typeof getCart>>>(getUseCartQueryKey());

      if (prev) {
        const removed = prev.items.find(i => i.id === cartItemId);
        if (removed) {
          const optimistic = {
            ...prev,
            items: prev.items.filter(i => i.id !== cartItemId),
            totalPriceInCents:
              prev.totalPriceInCents - removed.productVariant.priceInCents * removed.quantity,
          } as typeof prev;
          queryClient.setQueryData(getUseCartQueryKey(), optimistic);
        }
      }

      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(getUseCartQueryKey(), ctx.prev);
      toast.error(TOAST_MESSAGES.CART.PRODUCT_REMOVED_ERROR);
    },
    onSuccess: () => {
      toast.success(TOAST_MESSAGES.CART.PRODUCT_REMOVED);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
};
