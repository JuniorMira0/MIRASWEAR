import { removeProductFromCart } from "@/actions/remove-cart-product";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getUseCartQueryKey } from "../queries/use-cart";

export const getRemoveCartProductMutationKey = (cartItemId: string) =>
  ["remove-cart-product", cartItemId] as const;

export const useRemoveProductFromCart = (cartItemId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getRemoveCartProductMutationKey(cartItemId),
    mutationFn: () => removeProductFromCart({ cartItemId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey(false) });
    },
  });
};
