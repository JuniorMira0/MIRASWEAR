import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { getCategories } from '@/actions/get-categories';
import CheckoutSteps from '@/components/common/checkout-steps';
import { Header } from '@/components/common/header';
import { getCartWithItems, getUserShippingAddresses } from '@/data/cart/get-cart';
import { auth } from '@/lib/auth';

import CartSummary from '../components/cart-summary';
import Addresses from './components/addresses';

const IdentificationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.id) {
    redirect('/authentication');
  }
  const cart = await getCartWithItems(session.user.id);
  const categories = await getCategories();

  if (!cart || cart?.items.length === 0) {
    redirect('/');
  }

  const shippingAddresses = await getUserShippingAddresses(session.user.id);

  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );

  return (
    <div>
      <Header categories={categories} />
      <CheckoutSteps current={1} />
      <div className="px-5">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              <div className="space-y-4">
                <Addresses
                  shippingAddresses={shippingAddresses}
                  defaultShippingAddressId={cart.shippingAddress?.id || null}
                />
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
      <div className="mt-12"></div>
    </div>
  );
};

export default IdentificationPage;
