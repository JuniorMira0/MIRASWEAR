"use server";

import { and, eq } from "drizzle-orm";

import { db } from "@/db";
import { cartTable, shippingAddressTable } from "@/db/schema";
import { requireAuth } from "@/lib/auth-middleware";

import {
  DeleteShippingAddressSchema,
  deleteShippingAddressSchema,
} from "./schema";

export const deleteShippingAddress = async (
  data: DeleteShippingAddressSchema,
) => {
  deleteShippingAddressSchema.parse(data);

  const userId = await requireAuth();
  if (!userId) throw new Error("Unauthorized");

  const address = await db.query.shippingAddressTable.findFirst({
    where: (t, { eq, and }) =>
      and(eq(t.id, data.shippingAddressId), eq(t.userId, userId)),
  });
  if (!address) throw new Error("Address not found or unauthorized");

  const cart = await db.query.cartTable.findFirst({
    where: (t, { eq }) => eq(t.userId, userId),
  });
  if (cart && cart.shippingAddressId === data.shippingAddressId) {
    await db
      .update(cartTable)
      .set({ shippingAddressId: null })
      .where(eq(cartTable.id, cart.id));
  }

  await db
    .delete(shippingAddressTable)
    .where(
      and(
        eq(shippingAddressTable.id, data.shippingAddressId),
        eq(shippingAddressTable.userId, userId),
      ),
    );

  return { success: true };
};
