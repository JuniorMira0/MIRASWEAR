import { db } from "@/db";
import { cartTable, shippingAddressTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getCartWithItems = async (userId: string) => {
  return await db.query.cartTable.findFirst({
    where: eq(cartTable.userId, userId),
    with: {
      shippingAddress: true,
      items: {
        with: {
          productVariant: {
            with: {
              product: true,
            },
          },
          size: true,
        },
      },
    },
  });
};

export const getUserShippingAddresses = async (userId: string) => {
  return await db.query.shippingAddressTable.findMany({
    where: eq(shippingAddressTable.userId, userId),
  });
};
