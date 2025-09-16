"use server";

import { db } from "@/db";
import { productVariantTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  color: z.string().min(1),
  priceInCents: z.number().int().nonnegative(),
  imageUrl: z.string().min(1),
});

export async function updateProductVariant(data: z.infer<typeof UpdateVariantSchema>) {
  UpdateVariantSchema.parse(data);
  await requireAdmin();

  await db.update(productVariantTable).set({
    name: data.name,
    color: data.color,
    priceInCents: data.priceInCents,
    imageUrl: data.imageUrl,
  }).where(eq(productVariantTable.id, data.id));

  return true;
}
