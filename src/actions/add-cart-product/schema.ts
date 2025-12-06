import { z } from 'zod';

export const addProductToCartSchema = z.object({
  productVariantId: z.uuid(),
  quantity: z.number().min(1),
  productVariantSizeId: z.string().uuid().optional().nullable(),
  sizeLabel: z.string().optional().nullable(),
});

export type AddProductToCartSchema = z.infer<typeof addProductToCartSchema>;
