import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

import { getUserOrders } from '@/data/orders/get-orders';
import { auth } from '@/lib/auth';

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const orders = await getUserOrders(session.user.id);

  const payload = orders.map(order => ({
    id: order.id,
    totalPriceInCents: order.totalPriceInCents,
    status: order.status,
    createdAt:
      order.createdAt instanceof Date ? order.createdAt.toISOString() : String(order.createdAt),
    items: order.items.map(item => ({
      id: item.id,
      imageUrl: item.productVariant.imageUrl,
      productName: item.productVariant.product.name,
      productVariantName: item.productVariant.name,
      sizeLabel: item.size?.size ?? null,
      priceInCents: item.productVariant.priceInCents,
      quantity: item.quantity,
    })),
  }));

  return NextResponse.json(payload);
}
