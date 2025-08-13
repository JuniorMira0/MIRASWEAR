"use server";

import { db } from "@/db";

export interface LocalCartItem {
  productVariantId: string;
  quantity: number;
  productName?: string;
  productVariantName?: string;
  productVariantImageUrl?: string;
  productVariantPriceInCents?: number;
}

export const getLocalCartProductData = async (localItems: LocalCartItem[]) => {
  if (localItems.length === 0) return [];

  const productVariantIds = localItems.map((item) => item.productVariantId);

  const productVariants = await db.query.productVariantTable.findMany({
    where: (productVariant, { inArray }) =>
      inArray(productVariant.id, productVariantIds),
    with: {
      product: true,
    },
  });

  return localItems
    .map((localItem) => {
      const productVariant = productVariants.find(
        (pv) => pv.id === localItem.productVariantId,
      );

      if (!productVariant) return null;

      return {
        id: `local-${localItem.productVariantId}`,
        cartId: "local",
        productVariantId: localItem.productVariantId,
        quantity: localItem.quantity,
        productVariant,
      };
    })
    .filter(Boolean);
};
