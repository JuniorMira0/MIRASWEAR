import { decreaseCartProductQuantity } from '@/actions/decrease-cart-product-quantity';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { getUseCartQueryKey } from '../queries/use-cart';

const getDecreaseCartProductQuantityMutationKey = (cartItemId: string) =>
  ["decrease-cart-product-quantity", cartItemId] as const;

export const useDecreaseCartProductQuantity = (cartItemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getDecreaseCartProductQuantityMutationKey(cartItemId),
    mutationFn: () => decreaseCartProductQuantity({ cartItemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
};
