import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { and, eq, ne } from "drizzle-orm";

export const getProductVariantBySlug = async (slug: string) => {
  return await db.query.productVariantTable.findFirst({
    where: eq(productVariantTable.slug, slug),
    with: {
      sizes: true,
      product: {
        with: {
          variants: true,
        },
      },
    },
  });
};

export const getLikelyProducts = async (
  categoryId: string,
  excludeProductId: string,
) => {
  return await db.query.productTable.findMany({
    where: and(
      eq(productTable.categoryId, categoryId),
      ne(productTable.id, excludeProductId),
    ),
    with: {
      variants: true,
    },
  });
};
