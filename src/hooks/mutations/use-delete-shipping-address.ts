import { useMutation, useQueryClient } from '@tanstack/react-query';

import { deleteShippingAddress } from '@/actions/delete-shipping-address';

import { getUserAddressesQueryKey } from '../queries/use-user-addresses';

export const getDeleteShippingAddressMutationKey = () => ['delete-shipping-address'] as const;

export const useDeleteShippingAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: getDeleteShippingAddressMutationKey(),
    mutationFn: async (id: string) => {
      const res = await deleteShippingAddress({ shippingAddressId: id });
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getUserAddressesQueryKey(),
      });
    },
  });
};
