"use server";

import { db } from "@/db";
import { productTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";
import { z } from "zod";

const UpdateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
});

export async function updateProduct(data: z.infer<typeof UpdateProductSchema>) {
  UpdateProductSchema.parse(data);
  await requireAdmin();

  await db.update(productTable).set({
    name: data.name,
    slug: data.slug,
    description: data.description ?? "",
    categoryId: data.categoryId ?? undefined,
  }).where(eq(productTable.id, data.id));

  return true;
}
