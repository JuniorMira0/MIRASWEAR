"use server";

import { db } from "@/db";
import { cartItemTable, cartTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export interface LocalCartItem {
  productVariantId: string;
  quantity: number;
  productName?: string;
  productVariantName?: string;
  productVariantImageUrl?: string;
  productVariantPriceInCents?: number;
  productVariantSizeId?: string | null;
  sizeLabel?: string | null;
}

export const migrateLocalCartToServer = async (
  localCartItems: LocalCartItem[],
): Promise<{ ok: true; migrated: number } | { ok: false; error: string }> => {
  try {
    if (localCartItems.length === 0) return { ok: true, migrated: 0 };

    const session = await auth.api.getSession({ headers: await headers() });
    const userId = session?.user?.id;
    if (!userId) {
      return { ok: true, migrated: 0 };
    }

    // Busca ou cria carrinho do usuário
    let cart = await db.query.cartTable.findFirst({
      where: (cart, { eq }) => eq(cart.userId, userId),
    });

    if (!cart) {
      const [newCart] = await db
        .insert(cartTable)
        .values({ userId })
        .returning();
      cart = newCart;
    }

    const variantIds = Array.from(
      new Set(localCartItems.map((i) => i.productVariantId)),
    );
    const variants = await db.query.productVariantTable.findMany({
      where: (pv, { inArray }) => inArray(pv.id, variantIds),
    });
    const variantMap = new Map(variants.map((v) => [v.id, v]));

    // Load sizes for these variants to validate/resolve size ids
    const sizes = await db.query.productVariantSizeTable.findMany({
      where: (pvs, { inArray }) => inArray(pvs.productVariantId, variantIds),
    });
    const sizesByVariant = new Map<string, { id: string; size: string }[]>(
      sizes.reduce((acc, s) => {
        const list = acc.get(s.productVariantId) ?? [];
        list.push({ id: s.id, size: s.size });
        acc.set(s.productVariantId, list);
        return acc;
      }, new Map<string, { id: string; size: string }[]>()),
    );

    let migrated = 0;

    for (const localItem of localCartItems) {
      if (localItem.quantity <= 0) continue;
      const variant = variantMap.get(localItem.productVariantId);
      if (!variant) continue;

      // Resolve a valid size id for this variant (by id or label), else null
      const variantSizes = sizesByVariant.get(variant.id) ?? [];
      const resolvedSizeId = (() => {
        const byId = variantSizes.find(
          (s) => s.id === (localItem.productVariantSizeId ?? undefined),
        );
        if (byId) return byId.id;
        if (localItem.sizeLabel) {
          const byLabel = variantSizes.find(
            (s) => s.size?.toLowerCase() === localItem.sizeLabel?.toLowerCase(),
          );
          if (byLabel) return byLabel.id;
        }
        return null;
      })();

      const existingItem = await db.query.cartItemTable.findFirst({
        where: (cartItem, { eq, and, isNull: _isNull }) =>
          and(
            eq(cartItem.cartId, cart.id),
            eq(cartItem.productVariantId, localItem.productVariantId),
            resolvedSizeId
              ? eq(cartItem.productVariantSizeId, resolvedSizeId)
              : _isNull(cartItem.productVariantSizeId),
          ),
      });

      if (existingItem) {
        await db
          .update(cartItemTable)
          .set({ quantity: existingItem.quantity + localItem.quantity })
          .where(eq(cartItemTable.id, existingItem.id));
      } else {
        await db.insert(cartItemTable).values({
          cartId: cart.id,
          productVariantId: localItem.productVariantId,
          productVariantSizeId: resolvedSizeId,
          quantity: localItem.quantity,
        });
      }
      migrated += localItem.quantity;
    }
    return { ok: true, migrated };
  } catch (err) {
    console.error("migrateLocalCartToServer error:", err);
    return { ok: false, error: err instanceof Error ? err.message : "unknown" };
  }
};
