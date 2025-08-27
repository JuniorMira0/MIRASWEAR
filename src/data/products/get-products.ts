import { db } from "@/db";
import { productTable } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const getProducts = async () => {
  const products = await db.query.productTable.findMany({
    with: {
      variants: {
        with: {
          inventoryItems: true,
        },
      },
    },
  });
  return products;
};

export const getProductsByCategory = async (categoryId: string) => {
  return await db.query.productTable.findMany({
    where: eq(productTable.categoryId, categoryId),
    with: {
      variants: {
        with: {
          inventoryItems: true,
        },
      },
    },
  });
};

export const getRecentProducts = async () => {
  return await db.query.productTable.findMany({
    orderBy: [desc(productTable.createdAt)],
    with: {
      variants: {
        with: {
          inventoryItems: true,
        },
      },
    },
  });
};
