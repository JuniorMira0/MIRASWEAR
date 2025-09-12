"use server";

import { db } from "@/db";
import { productTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";

export async function deleteProduct(id: string) {
  if (!id) throw new Error("Invalid id");
  await requireAdmin();

  await db.delete(productTable).where(eq(productTable.id, id));
  return true;
}
