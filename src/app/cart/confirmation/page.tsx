import { headers } from 'next/headers';
import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { getCategories } from '@/actions/get-categories';
import CheckoutSteps from '@/components/common/checkout-steps';
import { Header } from '@/components/common/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCartWithItems } from '@/data/cart/get-cart';
import { auth } from '@/lib/auth';

import CartSummary from '../components/cart-summary';
import { formatAddress } from '../helpers/address';
import FinishOrderButton from './components/finish-order-button';

const ConfirmationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.id) {
    redirect('/');
  }
  const cart = await getCartWithItems(session.user.id);
  const categories = await getCategories();

  const isEmpty = !cart || cart.items.length === 0;
  if (isEmpty) {
    return (
      <div>
        <Header categories={categories} />
        <CheckoutSteps current={2} />
        <div className="px-5">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-center py-24">
              <div className="text-center">
                <Image
                  src="/empty-cart.png"
                  alt="Carrinho vazio"
                  className="mx-auto h-48 w-48"
                  width={192}
                  height={192}
                />
                <h2 className="mt-6 text-2xl font-semibold">Seu carrinho está vazio</h2>
                <p className="mt-2 text-sm text-gray-600">
                  Adicione produtos ao carrinho para finalizar sua compra.
                </p>
                <div className="mt-6">
                  <Link href="/" className="inline-block rounded-md bg-black px-4 py-2 text-white">
                    Continuar comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );
  if (!cart.shippingAddress) {
    redirect('/cart/identification');
  }
  return (
    <div>
      <Header categories={categories} />
      <CheckoutSteps current={2} />
      <div className="px-5">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Identificação</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <Card>
                      <CardContent>
                        <p className="text-sm">{formatAddress(cart.shippingAddress)}</p>
                      </CardContent>
                    </Card>
                  </CardContent>
                </Card>
                <div className="mt-4">
                  <FinishOrderButton />
                </div>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24">
                <CartSummary
                  subtotalInCents={cartTotalInCents}
                  totalInCents={cartTotalInCents}
                  products={cart.items.map(item => ({
                    id: item.productVariant.id,
                    name: item.productVariant.product.name,
                    variantName: item.productVariant.name,
                    sizeLabel: item.size?.size ?? null,
                    quantity: item.quantity,
                    priceInCents: item.productVariant.priceInCents,
                    imageUrl: item.productVariant.imageUrl,
                  }))}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPage;
