"use client";

import { MinusIcon, PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

import AddToCartButton from "./add-to-cart-button";

interface ProductActionsProps {
  productVariantId: string;
  sizes?: { id: string; size: string }[];
}

const ProductActions = ({ productVariantId, sizes }: ProductActionsProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [selectedSizeLabel, setSelectedSizeLabel] = useState<string | null>(
    null,
  );

  const handleDecrement = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleIncrement = () => {
    setQuantity((prev) => prev + 1);
  };

  return (
    <>
      {sizes && sizes.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-medium">Selecionar tamanho</h3>
          <div className="grid grid-cols-3 gap-3">
            {sizes.map((s) => (
              <Button
                key={s.id}
                type="button"
                variant={selectedSizeId === s.id ? "default" : "outline"}
                className="rounded-xl"
                onClick={() => {
                  setSelectedSizeId(s.id);
                  setSelectedSizeLabel(s.size);
                }}
              >
                {s.size}
              </Button>
            ))}
          </div>
          {!selectedSizeId && (
            <p className="text-muted-foreground text-xs">
              Selecione um tamanho para continuar
            </p>
          )}
        </div>
      )}
      <div className="space-y-3">
        <h3 className="font-medium">Quantidade</h3>
        <div className="flex w-32 items-center justify-between rounded-xl border">
          <Button size="icon" variant="ghost" onClick={handleDecrement}>
            <MinusIcon />
          </Button>
          <p className="tabular-nums">{quantity}</p>
          <Button size="icon" variant="ghost" onClick={handleIncrement}>
            <PlusIcon />
          </Button>
        </div>

        <div className="flex gap-3 pt-0.5">
          <div className="flex-1">
            <AddToCartButton
              productVariantId={productVariantId}
              quantity={quantity}
              productVariantSizeId={selectedSizeId}
              sizeLabel={selectedSizeLabel}
              disabled={!!sizes?.length && !selectedSizeId}
            />
          </div>
          <Button
            className="flex-1 rounded-full"
            size="lg"
            disabled={!!sizes?.length && !selectedSizeId}
          >
            Comprar agora
          </Button>
        </div>
      </div>
    </>
  );
};

export default ProductActions;
