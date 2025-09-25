import { eq } from 'drizzle-orm';

import { db } from '@/db';
import { orderTable } from '@/db/schema';

export const getUserOrders = async (userId: string) => {
  return await db.query.orderTable.findMany({
    where: eq(orderTable.userId, userId),
    with: {
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
