"use server";

import { db } from "@/db";

export const getProductVariantDetails = async (productVariantId: string) => {
  const productVariant = await db.query.productVariantTable.findFirst({
    where: (productVariant, { eq }) => eq(productVariant.id, productVariantId),
    with: {
      product: true,
    },
  });

  if (!productVariant) {
    throw new Error("Product variant not found");
  }

  return {
    productName: productVariant.product.name,
    productVariantName: productVariant.name,
    productVariantImageUrl: productVariant.imageUrl,
    productVariantPriceInCents: productVariant.priceInCents,
  };
};
