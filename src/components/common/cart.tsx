"use client";

import { Button } from "@/components/ui/button";
import { formatCentsToBRL } from "@/helpers/money";
import { useCartStore } from "@/hooks/cart-store";
import { useCart } from "@/hooks/queries/use-cart";
import { authClient } from "@/lib/auth-client";
import { ShoppingBasketIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";
import CartItem from "./cart-item";

export const Cart = () => {
  const { data: session } = authClient.useSession();
  const isLogged = !!session?.user;
  const { data: serverCart } = useCart();
  const { state: guestState, cartOpen, setCartOpen } = useCartStore();
  const router = useRouter();
  const cartItems = isLogged
    ? (serverCart?.items?.filter((i) => i) ?? []).map((i) => ({
        id: i.id,
        cartId: i.cartId,
        productVariantId: i.productVariantId,
        productVariantSizeId: i.productVariantSizeId ?? null,
        quantity: i.quantity,
        sizeLabel: i.size?.size ?? null,
        productVariant: i.productVariant,
      }))
    : guestState.items.map((i) => ({
        id: `local-${i.productVariantId}-${i.productVariantSizeId ?? ""}`,
        cartId: "local",
        productVariantId: i.productVariantId,
        productVariantSizeId: i.productVariantSizeId ?? null,
        quantity: i.quantity,
        sizeLabel: i.sizeLabel ?? null,
        productVariant: {
          id: i.productVariantId,
          name: i.productVariantName || "Produto",
          imageUrl: i.productVariantImageUrl || "/logo.png",
          priceInCents: i.productVariantPriceInCents || 0,
          product: { id: "local-product", name: i.productName || "Produto" },
        },
      }));
  const totalPriceInCents = cartItems.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );
  const totalItems = cartItems.reduce((acc, i) => acc + i.quantity, 0);
  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen}>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative md:h-12 md:w-12"
        >
          <ShoppingBasketIcon className="md:h-7 md:w-7" />
          {totalItems > 0 && (
            <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-[10px] font-bold">
              {totalItems > 99 ? "99+" : totalItems}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="md:max-w-[22rem] lg:max-w-[24rem]">
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>
        <div className="flex h-full min-h-0 flex-col px-5 pb-5">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <ScrollArea className="h-full flex-1">
              <div className="flex flex-col gap-8 pb-24">
                {cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Image
                      src="/empty-cart.png"
                      alt="Carrinho vazio"
                      width={160}
                      height={160}
                      className="mx-auto"
                    />
                    <h3 className="mt-4 text-lg font-semibold">Seu carrinho está vazio</h3>
                    <p className="mt-2 text-sm text-gray-600">Adicione produtos ao carrinho para finalizar sua compra.</p>
                    <div className="mt-4">
                      <Button
                        className="rounded-full"
                        onClick={() => {
                          setCartOpen(false);
                          router.push("/");
                        }}
                      >
                        Continuar comprando
                      </Button>
                    </div>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <CartItem
                      key={item.id}
                      id={item.id}
                      productVariantId={item.productVariant.id}
                      productVariantSizeId={item.productVariantSizeId}
                      productName={item.productVariant.product.name}
                      productVariantName={item.productVariant.name}
                      productVariantImageUrl={item.productVariant.imageUrl}
                      productVariantPriceInCents={
                        item.productVariant.priceInCents
                      }
                      quantity={item.quantity}
                      sizeLabel={item.sizeLabel}
                      isLocal={!isLogged}
                    />
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
          {cartItems.length > 0 && (
            <div className="bg-background sticky right-0 bottom-0 left-0 z-10 -mx-5 border-t px-5 pt-3 pb-4 shadow-[0_-6px_12px_rgba(0,0,0,0.06)]">
              <div className="flex flex-col gap-3">
                <Separator />
                <div className="flex items-center justify-between text-[12px] font-medium md:text-xs">
                  <p>Subtotal</p>
                  <p>{formatCentsToBRL(totalPriceInCents)}</p>
                </div>
                <div className="flex items-center justify-between text-[12px] font-medium md:text-xs">
                  <p>Entrega</p>
                  <p>GRÁTIS</p>
                </div>
                <Separator />
                <div className="flex items-center justify-between text-[12px] font-semibold md:text-xs">
                  <p>Total</p>
                  <p>{formatCentsToBRL(totalPriceInCents)}</p>
                </div>
                <Button
                  className="mt-2 rounded-full"
                  onClick={() => {
                    setCartOpen(false);
                    if (isLogged) {
                      router.push("/cart/identification");
                    } else {
                      router.push(
                        "/authentication?redirect=/cart/identification",
                      );
                    }
                  }}
                >
                  {isLogged ? "Finalizar compra" : "Fazer login para continuar"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
