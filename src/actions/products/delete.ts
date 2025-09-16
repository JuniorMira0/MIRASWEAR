"use server";

import { db } from "@/db";
import { productTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";
import { z } from "zod";

const DeleteProductSchema = z.object({ id: z.string().min(1) });

export async function deleteProduct(data: z.infer<typeof DeleteProductSchema>) {
  DeleteProductSchema.parse(data);
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized: admin required');

  await db.delete(productTable).where(eq(productTable.id, data.id));
  return true;
}

