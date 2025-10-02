import Image from 'next/image';
import Link from 'next/link';

import { formatCentsToBRL } from '@/helpers/money';
import { cn } from '@/lib/utils';

export type ProductItemVariant = {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  priceInCents: number | null;
  stock?: number | null;
  inventoryItems?: { quantity: number }[];
};

export type ProductItemProduct = {
  id: string;
  name: string;
  description: string | null;
  variants: ProductItemVariant[];
};

interface ProductItemProps {
  product: ProductItemProduct;
  textContainerClassName?: string;
}

const ProductItem = ({ product, textContainerClassName }: ProductItemProps) => {
  const firstVariant = product.variants[0];
  if (!firstVariant || !firstVariant.slug || !firstVariant.imageUrl) {
    return null;
  }
  const allOutOfStock = product.variants.every(v => {
    if (typeof v.stock === 'number') {
      return v.stock <= 0;
    }
    if (Array.isArray(v.inventoryItems)) {
      return v.inventoryItems.reduce((sum, item) => sum + (item.quantity ?? 0), 0) <= 0;
    }
    return false;
  });
  return (
    <Link href={`/product-variant/${firstVariant.slug}`} className="flex flex-col gap-4">
      <div className="relative">
        <Image
          src={firstVariant.imageUrl}
          alt={firstVariant.name}
          sizes="100vw"
          height={0}
          width={0}
          className="h-[170px] w-full rounded-xl object-cover md:h-auto"
        />
        {allOutOfStock && (
          <span className="bg-destructive absolute top-2 right-2 z-10 rounded px-2 py-1 text-xs font-bold text-white shadow">
            Esgotado
          </span>
        )}
      </div>
      <div
        className={cn(
          'flex w-full max-w-[160px] flex-col gap-1 md:max-w-[180px]',
          textContainerClassName,
        )}
        style={{ minWidth: 0 }}
      >
        <p className="truncate text-sm font-medium">{product.name}</p>
        <p className="text-muted-foreground truncate text-xs font-medium">{product.description}</p>
        {typeof firstVariant.priceInCents === 'number' ? (
          <p className="truncate text-sm font-semibold">
            {formatCentsToBRL(firstVariant.priceInCents)}
          </p>
        ) : null}
      </div>
    </Link>
  );
};

export default ProductItem;
