"use server";

import { db } from "@/db";
import {
  inventoryItemTable,
  productTable,
  productVariantSizeTable,
  productVariantTable
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { z } from "zod";

function sanitizeSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

const VariantSizeSchema = z.object({
  size: z.string().min(1),
  quantity: z.number().int().min(0),
});

const VariantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  color: z.string().optional(),
  priceInCents: z.number().int().min(0),
  imageUrl: z.string().optional(),
  sizes: z.array(VariantSizeSchema).optional(),
});

const CreateProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  variants: z.array(VariantSchema).min(1),
});

export async function createProduct(data: z.infer<typeof CreateProductSchema>) {
  CreateProductSchema.parse(data);

  await requireAdmin();

  if (data.categoryId) {
    const catId = data.categoryId as string;
    const cat = await db.query.categoryTable.findFirst({ where: (t, { eq }) => eq(t.id, catId) });
    if (!cat) {
      throw new Error("Categoria não encontrada");
    }
  }

  const baseProductSlug = sanitizeSlug(data.slug);
  let productSlug = baseProductSlug;
  let attempt = 1;
  while (true) {
    const existing = await db.query.productTable.findFirst({ where: (t, { eq }) => eq(t.slug, productSlug) });
    if (!existing) break;
    productSlug = `${baseProductSlug}-${attempt++}`;
  }

  const insertData: Record<string, any> = {
    name: data.name,
    slug: productSlug,
    description: data.description ?? "",
  };
  if (data.categoryId) insertData.categoryId = data.categoryId;

  const [createdProduct] = await db.insert(productTable).values(insertData as any).returning();

  // ensure variant slugs are unique within this product
  const usedVariantSlugs = new Set<string>();
  for (const v of data.variants) {
    const baseVariantSlug = sanitizeSlug(v.slug ?? v.name);
    let variantSlug = baseVariantSlug;
    let vAttempt = 1;
    while (usedVariantSlugs.has(variantSlug)) {
      variantSlug = `${baseVariantSlug}-${vAttempt++}`;
    }
    usedVariantSlugs.add(variantSlug);

    const variantInsert: Record<string, any> = {
      productId: createdProduct.id,
      name: v.name,
      slug: variantSlug,
      color: v.color ?? "",
      priceInCents: v.priceInCents,
      imageUrl: v.imageUrl ?? "",
    };

    const [createdVariant] = await db.insert(productVariantTable).values(variantInsert as any).returning();

    if (v.sizes && v.sizes.length > 0) {
      for (const s of v.sizes) {
        const [createdSize] = await db.insert(productVariantSizeTable).values({
          productVariantId: createdVariant.id,
          size: s.size,
        } as any).returning();

        await db.insert(inventoryItemTable).values({
          productVariantId: createdVariant.id,
          productVariantSizeId: createdSize.id,
          quantity: s.quantity,
        } as any);
      }
    } else {
      await db.insert(inventoryItemTable).values({
        productVariantId: createdVariant.id,
        productVariantSizeId: null,
        quantity: 0,
      } as any);
    }
  }

  return createdProduct;
}
