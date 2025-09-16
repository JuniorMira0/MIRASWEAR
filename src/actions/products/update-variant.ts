"use server";

import { db } from "@/db";
import { inventoryItemTable, productVariantTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  priceInCents: z.number().int().nonnegative(),
  imageUrl: z.string().min(1),
  stock: z.number().int().nonnegative().optional(),
});

export async function updateProductVariant(data: z.infer<typeof UpdateVariantSchema>) {
  UpdateVariantSchema.parse(data);
  await requireAdmin();

  await db.transaction(async (tx) => {
    await tx.update(productVariantTable).set({
      name: data.name,
      color: data.color,
      priceInCents: data.priceInCents,
      imageUrl: data.imageUrl,
    }).where(eq(productVariantTable.id, data.id));

    if (typeof data.stock === 'number') {
      const existing = await tx.query.inventoryItemTable.findFirst({
        where: (t, { and, eq, isNull }) => and(eq(t.productVariantId, data.id), isNull(t.productVariantSizeId)),
      });
      if (existing) {
        await tx.update(inventoryItemTable).set({ quantity: data.stock }).where(eq(inventoryItemTable.id, existing.id));
      } else {
        await tx.insert(inventoryItemTable).values({ productVariantId: data.id, quantity: data.stock });
      }
    }
  });

  return true;
}
