import { desc } from 'drizzle-orm';

import { db } from '@/db';
import { productTable } from '@/db/schema';

export const getProducts = async () => {
  const products = await db.query.productTable.findMany({
    where: (t, { eq }) => eq(t.isActive, true),
    with: {
      variants: {
        where: (v, { eq }) => eq(v.isActive, true),
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
    where: (t, { and, eq }) => and(eq(t.categoryId, categoryId), eq(t.isActive, true)),
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

export const getRecentProducts = async () => {
  return await db.query.productTable.findMany({
    where: (t, { eq }) => eq(t.isActive, true),
    orderBy: [desc(productTable.createdAt)],
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
