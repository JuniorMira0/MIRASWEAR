import { db } from "@/db";

export const getProductVariantBySlug = async (slug: string) => {
  return await db.query.productVariantTable.findFirst({
    where: (t, { eq, and }) => and(eq(t.slug, slug), eq(t.isActive, true)),
    with: {
      sizes: {
        with: {
          inventoryItems: true,
        },
      },
      inventoryItems: true,
      product: {
        with: {
          variants: {
            where: (v, { eq }) => eq(v.isActive, true),
            with: {
              inventoryItems: true,
            },
          },
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
    where: (t, { and, eq, ne }) => and(eq(t.categoryId, categoryId), ne(t.id, excludeProductId), eq(t.isActive, true)),
    with: {
      variants: {
        where: (v, { eq }) => eq(v.isActive, true),
        with: {
          inventoryItems: true,
        },
      },
    },
  });
};
