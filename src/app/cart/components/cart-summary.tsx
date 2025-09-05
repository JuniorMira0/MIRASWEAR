import Image from "next/image";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCentsToBRL } from "@/helpers/money";
import Link from "next/link";

interface CartSummaryProps {
  subtotalInCents: number;
  totalInCents: number;
  products: Array<{
    id: string;
    name: string;
    variantName: string;
    sizeLabel?: string | null;
    quantity: number;
    priceInCents: number;
    imageUrl: string;
  }>;
  title?: string;
  editUrl?: string;
}

const CartSummary = ({
  subtotalInCents,
  totalInCents,
  products,
  title,
  editUrl,
  showProducts = true,
}: CartSummaryProps & { showProducts?: boolean }) => {
  return (
    <Card>
      <CardHeader className="flex items-start justify-between">
        <CardTitle>{title ?? "Seu pedido"}</CardTitle>
        {editUrl ? (
          <div className="pt-1">
            <Link href={editUrl} className="text-muted-foreground text-sm">
              Editar
            </Link>
          </div>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between">
          <p className="text-sm">Subtotal</p>
          <p className="text-muted-foreground text-sm font-medium">
            {formatCentsToBRL(subtotalInCents)}
          </p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Transporte e Manuseio</p>
          <p className="text-muted-foreground text-sm font-medium">GRÁTIS</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm">Taxa Estimada</p>
          <p className="text-muted-foreground text-sm font-medium">—</p>
        </div>
        <div className="flex justify-between">
          <p className="text-sm font-semibold">Total</p>
          <p className="text-sm font-bold">{formatCentsToBRL(totalInCents)}</p>
        </div>

        <div className="py-3">
          <Separator />
        </div>

        {showProducts !== false && (
          <div className="space-y-4">
            {products.map((product, idx) => (
              <div
                key={product.id}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={56}
                    height={56}
                    className="rounded-md object-cover"
                  />
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{product.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {product.variantName}{" "}
                      {product.sizeLabel ? `| ${product.sizeLabel}` : ""}
                    </p>
                  </div>
                </div>
                <div className="text-sm font-bold">
                  {formatCentsToBRL(product.priceInCents)}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CartSummary;
