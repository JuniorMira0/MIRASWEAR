import { NextResponse } from 'next/server';

import { getProducts, getRecentProducts } from '@/data/products/get-products';

export async function GET(req: Request) {
  const products = await getProducts();
  const newlyAddedProducts = await getRecentProducts();
  return NextResponse.json({ products, newlyAddedProducts });
}
