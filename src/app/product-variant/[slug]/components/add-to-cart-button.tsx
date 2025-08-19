"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addProductToCart } from "@/actions/add-cart-product";
import { getProductVariantDetails } from "@/actions/get-product-variant-details";
import { LoadingButton } from "@/components/ui/loading-button";
import { useCartStore } from "@/hooks/cart-store";
import { getUseCartQueryKey } from "@/hooks/queries/use-cart";
import { authClient } from "@/lib/auth-client";

interface AddToCartButtonProps {
  productVariantId: string;
  quantity: number;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
}: AddToCartButtonProps) => {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { addItem: addGuestItem } = useCartStore();

  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity],
    mutationFn: () =>
      addProductToCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
      toast.success("Produto adicionado à sacola!");
    },
    onError: (error) => {
      toast.error("Erro ao adicionar produto à sacola");
      console.error(error);
    },
  });

  const handleAddToCart = async () => {
    if (session?.user) {
      mutate();
    } else {
      try {
        const productDetails = await getProductVariantDetails(productVariantId);
        addGuestItem(productVariantId, quantity, {
          productName: productDetails.productName,
          productVariantName: productDetails.productVariantName,
          productVariantImageUrl: productDetails.productVariantImageUrl,
          productVariantPriceInCents: productDetails.productVariantPriceInCents,
        });
        toast.success("Produto adicionado à sacola!");
      } catch (error) {
        console.error("Erro ao buscar dados do produto:", error);
        addGuestItem(productVariantId, quantity);
        toast.success("Produto adicionado à sacola!");
      }
    }
  };

  return (
    <LoadingButton
      className="rounded-full"
      size="lg"
      variant="outline"
      isLoading={isPending}
      onClick={handleAddToCart}
    >
      Adicionar à sacola
    </LoadingButton>
  );
};

export default AddToCartButton;
