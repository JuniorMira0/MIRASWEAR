import { useMutation, useQueryClient } from "@tanstack/react-query";

import { deleteShippingAddress } from "@/actions/delete-shipping-address";
import { getUserAddressesQueryKey } from "../queries/use-user-addresses";

export const getDeleteShippingAddressMutationKey = () =>
  ["delete-shipping-address"] as const;

export const useDeleteShippingAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getDeleteShippingAddressMutationKey(),
    mutationFn: (id: string) =>
      deleteShippingAddress({ shippingAddressId: id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUserAddressesQueryKey(),
      });
    },
  });
};
