"use client";

import { ShoppingBasketIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCentsToBRL } from "@/helpers/money";
import { authClient } from "@/lib/auth-client";

import { useCart } from "@/hooks/queries/use-cart";
import Link from "next/link";
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
  const { data: cart } = useCart();
  const isLocal = !session?.user;

  // Calcula o total do carrinho (local ou servidor)
  const getTotalPrice = () => {
    if (!cart?.items) return 0;

    return cart.items
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .reduce((total, item) => {
        if (!item) return total;
        return total + item.productVariant.priceInCents * item.quantity;
      }, 0);
  };

  const totalPriceInCents =
    isLocal || !("totalPriceInCents" in (cart || {}))
      ? getTotalPrice()
      : ((cart as any)?.totalPriceInCents ?? 0);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon">
          <ShoppingBasketIcon />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Carrinho</SheetTitle>
        </SheetHeader>

        <div className="flex h-full flex-col px-5 pb-5">
          <div className="flex h-full max-h-full flex-col overflow-hidden">
            <ScrollArea className="h-full">
              <div className="flex h-full flex-col gap-8">
                {cart?.items
                  ?.filter(
                    (item): item is NonNullable<typeof item> => item !== null,
                  )
                  .map((item) => {
                    if (!item) return null;
                    return (
                      <CartItem
                        key={item.id}
                        id={item.id}
                        productVariantId={item.productVariant.id}
                        productName={item.productVariant.product.name}
                        productVariantName={item.productVariant.name}
                        productVariantImageUrl={item.productVariant.imageUrl}
                        productVariantPriceInCents={
                          item.productVariant.priceInCents
                        }
                        quantity={item.quantity}
                        isLocal={isLocal}
                      />
                    );
                  })}
              </div>
            </ScrollArea>
          </div>

          {cart?.items && cart?.items.length > 0 && (
            <div className="flex flex-col gap-4">
              <Separator />

              <div className="flex items-center justify-between text-xs font-medium">
                <p>Subtotal</p>
                <p>{formatCentsToBRL(totalPriceInCents)}</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xs font-medium">
                <p>Entrega</p>
                <p>GRÁTIS</p>
              </div>

              <Separator />

              <div className="flex items-center justify-between text-xs font-medium">
                <p>Total</p>
                <p>{formatCentsToBRL(totalPriceInCents)}</p>
              </div>

              <Button className="mt-5 rounded-full" asChild>
                <Link href="/cart/identification">Finalizar compra</Link>
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

// SERVER ACTION
