"use server";

import { and, eq, isNull } from "drizzle-orm";

import { db } from "@/db";
import { inventoryItemTable } from "@/db/schema";

export const getVariantStock = async (
  productVariantId: string,
  productVariantSizeId?: string | null,
) => {
  const rows = await db
    .select({ quantity: inventoryItemTable.quantity })
    .from(inventoryItemTable)
    .where(
      and(
        eq(inventoryItemTable.productVariantId, productVariantId),
        productVariantSizeId
          ? eq(inventoryItemTable.productVariantSizeId, productVariantSizeId)
          : isNull(inventoryItemTable.productVariantSizeId),
      ),
    );
  return rows.reduce((acc, r) => acc + (r.quantity ?? 0), 0);
};
