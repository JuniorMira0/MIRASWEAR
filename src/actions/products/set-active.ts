"use server";

import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";
import { z } from "zod";

const SetActiveSchema = z.object({ id: z.string().min(1), active: z.boolean() });

export async function setProductActive(data: z.infer<typeof SetActiveSchema>) {
  SetActiveSchema.parse(data);
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized: admin required');

  await db.update(productVariantTable).set({ isActive: data.active }).where(eq(productVariantTable.productId, data.id));
  await db.update(productTable).set({ isActive: data.active }).where(eq(productTable.id, data.id));
  return true;
}
