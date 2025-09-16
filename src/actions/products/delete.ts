"use server";

import { db } from "@/db";
import { productTable, productVariantTable } from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { eq } from "drizzle-orm";
import { z } from "zod";

const DeleteProductSchema = z.object({ id: z.string().min(1) });

export async function deleteProduct(data: z.infer<typeof DeleteProductSchema>) {
  DeleteProductSchema.parse(data);
  const admin = await requireAdmin();
  if (!admin) throw new Error('Unauthorized: admin required');

  const variants = await db.query.productVariantTable.findMany({ where: (t, { eq }) => eq(t.productId, data.id) });
  const variantIds = variants.map((v) => v.id);

  if (variantIds.length > 0) {
    const existingOrder = await db.query.orderItemTable.findFirst({ where: (t, { inArray }) => inArray(t.productVariantId, variantIds) });
    if (existingOrder) {
      throw new Error('Não é possível remover produto porque há pedidos que referenciam suas variantes.');
    }
  }

  await db.update(productVariantTable).set({ isActive: false }).where(eq(productVariantTable.productId, data.id));
  await db.update(productTable).set({ isActive: false }).where(eq(productTable.id, data.id));
  return true;
}

