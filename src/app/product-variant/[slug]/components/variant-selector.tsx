import Image from "next/image";
import Link from "next/link";

import { productVariantTable } from "@/db/schema";

interface VariantSelectorProps {
  selectedVariantSlug: string;
  variants: (typeof productVariantTable.$inferSelect & { stock?: number })[];
}

const VariantSelector = ({
  selectedVariantSlug,
  variants,
}: VariantSelectorProps) => {
  const sortedVariants = [...variants].sort((a, b) => {
    const aOut = (a.stock ?? 0) <= 0;
    const bOut = (b.stock ?? 0) <= 0;
    if (aOut === bOut) return 0;
    return aOut ? 1 : -1;
  });

  return (
    <div className="flex items-center gap-2.5">
      {sortedVariants.map((variant) => (
        <Link
          href={`/product-variant/${variant.slug}`}
          key={variant.id}
          className={
            selectedVariantSlug === variant.slug
              ? "border-primary rounded-xl border-2"
              : ""
          }
        >
          <Image
            width={56}
            height={56}
            src={variant.imageUrl}
            alt={variant.name}
            className="rounded-xl"
          />
        </Link>
      ))}
    </div>
  );
};

export default VariantSelector;
