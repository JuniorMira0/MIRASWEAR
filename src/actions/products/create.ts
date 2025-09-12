"use server";

import { db } from "@/db";
import {
  inventoryItemTable,
  productTable,
  productVariantSizeTable,
  productVariantTable
} from "@/db/schema";
import { requireAdmin } from "@/lib/auth-middleware";
import { logger } from "@/lib/logger";
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
  stock: z.number().int().min(0).optional(),
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
  try {
    CreateProductSchema.parse(data);
  } catch (err) {
    logger.error("createProduct validation failed:", err, { data });
    throw err;
  }

  await requireAdmin();

  if (data.categoryId) {
    const catId = data.categoryId as string;
    const cat = await db.query.categoryTable.findFirst({ where: (t, { eq }) => eq(t.id, catId) });
    if (!cat) {
      logger.error("createProduct: category not found", { categoryId: catId, data });
      throw new Error("Categoria não encontrada");
    }
  }

  const baseProductSlug = sanitizeSlug((data.slug || data.name) as string);
  let productSlug = baseProductSlug;
  let attempt = 1;
  while (true) {
    const existing = await db.query.productTable.findFirst({ where: (t, { eq }) => eq(t.slug, productSlug) });
    if (!existing) break;
    productSlug = `${baseProductSlug}-${attempt++}`;
  }

  try {
    const createdProduct = await db.transaction(async (tx) => {
      const insertData: Record<string, any> = {
        name: data.name,
        slug: productSlug,
        description: data.description ?? "",
      };
      if (data.categoryId) insertData.categoryId = data.categoryId;

      const [prod] = await tx.insert(productTable).values(insertData as any).returning();
      if (!prod) {
        logger.error("createProduct: failed to insert product", { insertData });
        throw new Error("Failed to create product");
      }

      // ensure variant slugs are unique within this product
      const usedVariantSlugs = new Set<string>();
      for (const v of data.variants) {
        const colorPart = (v.color || "").toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").trim();
        const baseVariantSlugCandidate = colorPart ? `${productSlug}-${colorPart}` : `${productSlug}-${v.name}`;
        const baseVariantSlug = sanitizeSlug(baseVariantSlugCandidate);
        let variantSlug = baseVariantSlug;
        let vAttempt = 1;
        while (true) {
          const exists = await tx.query.productVariantTable.findFirst({ where: (t, { eq }) => eq(t.slug, variantSlug) });
          if (!exists && !usedVariantSlugs.has(variantSlug)) break;
          variantSlug = `${baseVariantSlug}-${vAttempt++}`;
        }
        usedVariantSlugs.add(variantSlug);

        const variantInsert: Record<string, any> = {
          productId: prod.id,
          name: v.name,
          slug: variantSlug,
          color: v.color ?? "",
          priceInCents: v.priceInCents,
          imageUrl: v.imageUrl ?? "",
        };

        const [createdVariant] = await tx.insert(productVariantTable).values(variantInsert as any).returning();
        if (!createdVariant) {
          logger.error("createProduct: failed to insert variant", { variantInsert });
          throw new Error("Failed to create product variant");
        }

        if (v.sizes && v.sizes.length > 0) {
          for (const s of v.sizes) {
            const [createdSize] = await tx.insert(productVariantSizeTable).values({
              productVariantId: createdVariant.id,
              size: s.size,
            } as any).returning();

            if (!createdSize) {
              logger.error("createProduct: failed to insert variant size", { productVariantId: createdVariant.id, size: s.size });
              throw new Error("Failed to create variant size");
            }

            await tx.insert(inventoryItemTable).values({
              productVariantId: createdVariant.id,
              productVariantSizeId: createdSize.id,
              quantity: s.quantity,
            } as any);
          }
        } else {
          const qty = typeof v.stock === 'number' ? v.stock : 0;
          await tx.insert(inventoryItemTable).values({
            productVariantId: createdVariant.id,
            productVariantSizeId: null,
            quantity: qty,
          } as any);
        }
      }

      return prod;
    });

    return createdProduct;
  } catch (err: unknown) {
    logger.error("createProduct failed (final catch):", err, {
      product: { name: data.name, slug: data.slug },
      variants: data.variants,
      stack: err instanceof Error ? err.stack : undefined,
    });
    if (err instanceof Error) throw new Error(`Erro ao criar produto: ${err.message}`);
    throw new Error("Erro ao criar produto: motivo desconhecido");
  }
}
