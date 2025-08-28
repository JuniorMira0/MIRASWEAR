import { TOAST_MESSAGES } from "@/constants/toast-messages";
import { formatCentsToBRL } from "@/helpers/money";
import { useCartStore } from "@/hooks/cart-store";
import { useDecreaseCartProductQuantity } from "@/hooks/mutations/use-decrease-cart-product";
import { useIncreaseCartProduct } from "@/hooks/mutations/use-increase-cart-product";
import { useRemoveProductFromCart } from "@/hooks/mutations/use-remove-product-from-cart";
import { MinusIcon, PlusIcon, TrashIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "../ui/button";

interface CartItemProps {
  id: string;
  productName: string;
  productVariantId: string;
  productVariantName: string;
  productVariantImageUrl: string;
  productVariantPriceInCents: number;
  quantity: number;
  isLocal?: boolean;
  sizeLabel?: string | null;
}

const CartItem = ({
  id,
  productName,
  productVariantId,
  productVariantName,
  productVariantImageUrl,
  productVariantPriceInCents,
  quantity,
  isLocal = false,
  sizeLabel,
}: CartItemProps) => {
  const { removeItem, decrease, addItem } = useCartStore();

  const removeProductFromCartMutation = useRemoveProductFromCart(id);
  const decreaseCartProductQuantityMutation =
    useDecreaseCartProductQuantity(id);
  const increaseCartProductQuantityMutation =
    useIncreaseCartProduct(productVariantId);

  const handleDeleteClick = () => {
    if (isLocal) {
      removeItem(productVariantId);
      toast.success(TOAST_MESSAGES.CART.PRODUCT_REMOVED);
    } else {
      removeProductFromCartMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.CART.PRODUCT_REMOVED);
        },
        onError: (error) => {
          toast.error(TOAST_MESSAGES.CART.PRODUCT_REMOVED_ERROR);
        },
      });
    }
  };

  const handleDecreaseQuantityClick = () => {
    if (isLocal) {
      decrease(productVariantId);
    } else {
      decreaseCartProductQuantityMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.CART.QUANTITY_DECREASED);
        },
        onError: (error) => {
          toast.error(TOAST_MESSAGES.CART.QUANTITY_DECREASED_ERROR);
        },
      });
    }
  };

  const handleIncreaseQuantityClick = () => {
    if (isLocal) {
      addItem(productVariantId, 1);
    } else {
      increaseCartProductQuantityMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success(TOAST_MESSAGES.CART.QUANTITY_INCREASED);
        },
        onError: (error) => {
          toast.error(TOAST_MESSAGES.CART.QUANTITY_DECREASED_ERROR);
        },
      });
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Image
          src={productVariantImageUrl}
          alt={productVariantName}
          width={78}
          height={78}
          className="rounded-lg"
        />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold">{productName}</p>
          <p className="text-muted-foreground text-xs font-medium">
            {productVariantName}
            {sizeLabel && <span className="ml-2">Tam: {sizeLabel}</span>}
          </p>
          <div className="flex w-[100px] items-center justify-between rounded-lg border p-1">
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={handleDecreaseQuantityClick}
            >
              <MinusIcon />
            </Button>
            <p className="text-xs font-medium">{quantity}</p>
            <Button
              className="h-4 w-4"
              variant="ghost"
              onClick={handleIncreaseQuantityClick}
            >
              <PlusIcon />
            </Button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-end justify-center gap-2">
        <Button variant="outline" size="icon" onClick={handleDeleteClick}>
          <TrashIcon />
        </Button>
        <p className="text-sm font-bold">
          {formatCentsToBRL(productVariantPriceInCents)}
        </p>
      </div>
    </div>
  );
};

export default CartItem;
