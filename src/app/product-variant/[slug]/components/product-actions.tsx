"use client";

import { Info, MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import AddToCartButton from "./add-to-cart-button";

interface ProductActionsProps {
  productVariantId: string;
  sizes?: { id: string; size: string; stock?: number }[];
  variantStock?: number;
}

const ProductActions = ({
  productVariantId,
  sizes,
  variantStock,
}: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string | null>(
    null,
  );

  const availableStock = (() => {
    if (sizes && sizes.length > 0) {
      const s = sizes.find((x) => x.id === selectedSizeId);
      return s?.stock ?? 0;
    }
    return variantStock ?? 0;
  })();

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncrement = () => {
    setQuantity((prev) => {
      const next = prev + 1;
      if (availableStock && next > availableStock) return prev;
      return next;
    });
  };

  return (
    <>
      {sizes && sizes.length > 0 && (
        <div className="space-y-2.5">
          <h3 className="font-medium">Selecionar tamanho</h3>
          <div className="grid grid-cols-4 gap-2 md:grid-cols-6 md:gap-2.5">
            {sizes.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant="outline"
                size="sm"
                className={cn(
                  "h-8 w-10 rounded-md px-0 text-sm md:h-9 md:w-12",
                  selectedSizeId === s.id
                    ? "ring-primary border-primary font-semibold ring-2"
                    : "opacity-90",
                )}
                onClick={() => {
                  if ((s.stock ?? 0) <= 0) return;
                  setSelectedSizeId(s.id);
                  setSelectedSizeLabel(s.size);
                }}
                aria-pressed={selectedSizeId === s.id}
                aria-label={`Selecionar tamanho ${s.size}`}
                disabled={(s.stock ?? 0) <= 0}
              >
                {s.size}
              </Button>
            ))}
          </div>
          {!selectedSizeId && (
            <p className="text-muted-foreground text-[11px]">
              Selecione um tamanho para continuar
            </p>
          )}
        </div>
      )}
      <div className="space-y-2.5">
        <h3 className="font-medium">Quantidade</h3>
        <div className="flex h-10 w-28 items-center justify-between rounded-xl border">
          <Button size="icon" variant="ghost" onClick={handleDecrement}>
            <MinusIcon />
          </Button>
          <p className="tabular-nums">{quantity}</p>
          <Button size="icon" variant="ghost" onClick={handleIncrement}>
            <PlusIcon />
          </Button>
        </div>
        {(sizes?.length ? !!selectedSizeId : true) &&
          availableStock > 0 &&
          availableStock <= 3 && (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Info size={14} aria-label="informação" />
              Últimas unidades! Não deixe pra depois
            </span>
          )}

        <div className="pt-0.5">
          <AddToCartButton
            productVariantId={productVariantId}
            quantity={quantity}
            productVariantSizeId={selectedSizeId}
            sizeLabel={selectedSizeLabel}
            disabled={
              (!!sizes?.length && !selectedSizeId) ||
              (!sizes?.length && (variantStock ?? 0) <= 0)
            }
            buttonText="Compre"
          />
        </div>
      </div>
    </>
  );
};

export default ProductActions;
