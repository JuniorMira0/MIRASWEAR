import { useMutation, useQueryClient } from "@tanstack/react-query";

import { addProductToCart } from "@/actions/add-cart-product";
import { LoadingButton } from "@/components/ui/loading-button";
import { getUseCartQueryKey } from "@/hooks/queries/use-cart";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
}: AddToCartButtonProps) => {
  const queryClient = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity],
    mutationFn: () =>
      addProductToCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
    },
  });
  return (
    <LoadingButton
      className="rounded-full"
      size="lg"
      variant="outline"
      isLoading={isPending}
      onClick={() => mutate()}
    >
      Adicionar à sacola
    </LoadingButton>
  );
};

export default AddToCartButton;
