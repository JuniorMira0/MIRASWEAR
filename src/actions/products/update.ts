'use server';

import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db';
import {
  inventoryItemTable,
  productTable,
  productVariantSizeTable,
  productVariantTable,
} from '@/db/schema';
import { requireAdmin } from '@/lib/auth-middleware';

function sanitizeSlug(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const VariantSizeSchema = z.object({
  size: z.string().min(1),
  quantity: z.number().int().min(0),
});

const VariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  slug: z.string().optional(),
  color: z.string().optional(),
  priceInCents: z.number().int().min(0),
  stock: z.number().int().min(0).optional(),
  imageUrl: z.string().optional(),
  sizes: z.array(VariantSizeSchema).optional(),
});

const UpdateProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  variants: z.array(VariantSchema).optional(),
});

export async function updateProduct(data: z.infer<typeof UpdateProductSchema>) {
  UpdateProductSchema.parse(data);
  await requireAdmin();

  try {
    await db.transaction(async tx => {
      await tx
        .update(productTable)
        .set({
          name: data.name,
          slug: data.slug,
          description: data.description ?? '',
          categoryId: data.categoryId ?? undefined,
        })
        .where(eq(productTable.id, data.id));

      if (Array.isArray(data.variants)) {
        const prod = await tx.query.productTable.findFirst({
          where: (t, { eq }) => eq(t.id, data.id),
        });
        const baseProductSlug = prod ? prod.slug : sanitizeSlug(data.name);

        const usedVariantSlugs = new Set<string>();

        for (const v of data.variants) {
          let variantId = v.id;
          if (variantId) {
            await tx
              .update(productVariantTable)
              .set({
                name: v.name,
                color: v.color ?? '',
                priceInCents: v.priceInCents,
                imageUrl: v.imageUrl ?? '',
              })
              .where(eq(productVariantTable.id, variantId));
          } else {
            const colorPart = (v.color || '')
              .toLowerCase()
              .replace(/[^a-z0-9\s-]/g, '')
              .replace(/\s+/g, '-')
              .trim();
            const baseVariantSlugCandidate = colorPart
              ? `${baseProductSlug}-${colorPart}`
              : `${baseProductSlug}-${v.name}`;
            const baseVariantSlug = sanitizeSlug(baseVariantSlugCandidate);
            let variantSlug = baseVariantSlug;
            let vAttempt = 1;
            while (true) {
              const exists = await tx.query.productVariantTable.findFirst({
                where: (t, { eq }) => eq(t.slug, variantSlug),
              });
              if (!exists && !usedVariantSlugs.has(variantSlug)) break;
              variantSlug = `${baseVariantSlug}-${vAttempt++}`;
            }
            usedVariantSlugs.add(variantSlug);

            const [created] = await tx
              .insert(productVariantTable)
              .values({
                productId: data.id,
                name: v.name,
                slug: variantSlug,
                color: v.color ?? '',
                priceInCents: v.priceInCents,
                imageUrl: v.imageUrl ?? '',
              } as any)
              .returning();

            if (!created) throw new Error('Failed to create variant');
            variantId = created.id;
          }

          if (Array.isArray(v.sizes) && v.sizes.length > 0) {
            for (const s of v.sizes) {
              const existingSize = await tx.query.productVariantSizeTable.findFirst({
                where: (t, { and, eq }) =>
                  and(eq(t.productVariantId, variantId!), eq(t.size, s.size)),
              });
              let sizeId: string;
              if (existingSize) {
                sizeId = existingSize.id;
              } else {
                const [createdSize] = await tx
                  .insert(productVariantSizeTable)
                  .values({ productVariantId: variantId!, size: s.size } as any)
                  .returning();
                if (!createdSize) throw new Error('Failed to create variant size');
                sizeId = createdSize.id;
              }

              const existingInv = await tx.query.inventoryItemTable.findFirst({
                where: (t, { and, eq }) =>
                  and(eq(t.productVariantId, variantId!), eq(t.productVariantSizeId, sizeId)),
              });
              if (existingInv) {
                await tx
                  .update(inventoryItemTable)
                  .set({ quantity: s.quantity })
                  .where(eq(inventoryItemTable.id, existingInv.id));
              } else {
                await tx.insert(inventoryItemTable).values({
                  productVariantId: variantId!,
                  productVariantSizeId: sizeId,
                  quantity: s.quantity,
                } as any);
              }
            }
          } else if (typeof v.stock === 'number') {
            const existing = await tx.query.inventoryItemTable.findFirst({
              where: (t, { and, eq, isNull }) =>
                and(eq(t.productVariantId, variantId!), isNull(t.productVariantSizeId)),
            });
            if (existing) {
              await tx
                .update(inventoryItemTable)
                .set({ quantity: v.stock })
                .where(eq(inventoryItemTable.id, existing.id));
            } else {
              await tx.insert(inventoryItemTable).values({
                productVariantId: variantId!,
                quantity: v.stock,
              } as any);
            }
          }
        }
      }
    });
  } catch (err: unknown) {
    const e: any = err;
    throw new Error(`Erro ao atualizar produto: ${e?.message ?? String(e)}`);
  }

  return true;
}
