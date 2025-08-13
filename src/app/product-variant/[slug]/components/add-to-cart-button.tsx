import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { addProductToCart } from "@/actions/add-cart-product";
import { getProductVariantDetails } from "@/actions/get-product-variant-details";
import { LoadingButton } from "@/components/ui/loading-button";
import { getUseCartQueryKey } from "@/hooks/queries/use-cart";
import { useLocalCart } from "@/hooks/use-local-cart";
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
  const localCart = useLocalCart();

  const { mutate, isPending } = useMutation({
    mutationKey: ["addProductToCart", productVariantId, quantity],
    mutationFn: () =>
      addProductToCart({
        productVariantId,
        quantity,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey(false) });
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
        // Busca dados completos do produto para salvar no localStorage
        const productDetails = await getProductVariantDetails(productVariantId);
        localCart.addItem(productVariantId, quantity, productDetails);
        toast.success("Produto adicionado à sacola!");
      } catch (error) {
        console.error("Erro ao buscar dados do produto:", error);
        // Fallback: adiciona sem os dados completos
        localCart.addItem(productVariantId, quantity);
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
