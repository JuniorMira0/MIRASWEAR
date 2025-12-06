'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { VariantProps } from 'class-variance-authority';
import { toast } from 'sonner';

import { addProductToCart } from '@/actions/add-cart-product';
import { getProductVariantDetails } from '@/actions/get-product-variant-details';
import { LoadingButton } from '@/components/ui/loading-button';
import { useCartStore } from '@/hooks/cart-store';
import { getUseCartQueryKey } from '@/hooks/queries/use-cart';
import { authClient } from '@/lib/auth-client';

interface AddToCartButtonProps
  extends VariantProps<typeof import('@/components/ui/button').buttonVariants> {
  productVariantId: string;
  quantity: number;
  productVariantSizeId?: string | null;
  sizeLabel?: string | null;
  disabled?: boolean;
  buttonText: string;
  className?: string;
}

const AddToCartButton = ({
  productVariantId,
  quantity,
  productVariantSizeId,
  sizeLabel,
  disabled,
  buttonText,
  variant = 'default',
  size = 'lg',
  className,
}: AddToCartButtonProps) => {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { addItem: addGuestItem, setCartOpen } = useCartStore();

  const { mutate, isPending } = useMutation({
    mutationKey: [
      'addProductToCart',
      productVariantId,
      quantity,
      productVariantSizeId ?? 'no-size',
    ],
    mutationFn: () =>
      addProductToCart({
        productVariantId,
        quantity,
        productVariantSizeId,
        sizeLabel,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getUseCartQueryKey() });
      toast.success('Produto adicionado à sacola!');
    },
    onError: error => {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(message || 'Erro ao adicionar produto à sacola');
      console.error(error);
    },
  });

  const handleAddToCart = async () => {
    setCartOpen(true);
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
          productVariantSizeId: productVariantSizeId ?? null,
          sizeLabel: sizeLabel ?? null,
        });
        setCartOpen(true);
        toast.success('Produto adicionado à sacola!');
      } catch (error) {
        addGuestItem(productVariantId, quantity, {
          productVariantSizeId: productVariantSizeId ?? null,
          sizeLabel: sizeLabel ?? null,
        });
        setCartOpen(true);
        toast.success('Produto adicionado à sacola!');
      }
    }
  };

  return (
    <LoadingButton
      className={className}
      size={size}
      variant={variant}
      isLoading={isPending}
      disabled={disabled}
      onClick={handleAddToCart}
    >
      {buttonText}
    </LoadingButton>
  );
};

export default AddToCartButton;
