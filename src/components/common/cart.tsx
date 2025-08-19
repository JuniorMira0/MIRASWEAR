"use client";

import { Button } from "@/components/ui/button";
import { formatCentsToBRL } from "@/helpers/money";
import { useCartStore } from "@/hooks/cart-store";
import { useCart } from "@/hooks/queries/use-cart";
import { authClient } from "@/lib/auth-client";
import { ShoppingBasketIcon } from "lucide-react";
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
  const isLogged = !!session?.user;
  const { data: serverCart } = useCart();
  const { state: guestState } = useCartStore();
  const cartItems = isLogged
    ? (serverCart?.items?.filter((i) => i) ?? [])
    : guestState.items.map((i) => ({
        id: `local-${i.productVariantId}`,
        cartId: "local",
        productVariantId: i.productVariantId,
        quantity: i.quantity,
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
                {cartItems.map((item) => (
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
                    isLocal={!isLogged}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
          {cartItems.length > 0 && (
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
