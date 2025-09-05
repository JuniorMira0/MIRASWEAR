import { headers } from "next/headers";
import { redirect } from "next/navigation";

import Footer from "@/components/common/footer";
import { Header } from "@/components/common/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCartWithItems } from "@/data/cart/get-cart";
import { auth } from "@/lib/auth";

import { getCategories } from "@/actions/get-categories";
import CheckoutSteps from "@/components/common/checkout-steps";
import CartSummary from "../components/cart-summary";
import FinishOrderButton from "../confirmation/components/finish-order-button";
import { formatAddress } from "../helpers/address";

const PaymentPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.id) redirect("/");
  const cart = await getCartWithItems(session.user.id);
  const categories = await getCategories();
  if (!cart || cart.items.length === 0) redirect("/");
  if (!cart.shippingAddress) redirect("/cart/identification");

  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );

  return (
    <div>
      <Header categories={categories} />
      <CheckoutSteps current={3} />
      <div className="px-5">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
            <div className="lg:col-span-8">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pagamento</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Card>
                      <CardContent>
                        <p className="text-sm">Identificação</p>
                        <p className="mt-2 text-sm">
                          {formatAddress(cart.shippingAddress)}
                        </p>
                      </CardContent>
                    </Card>
                    <div className="mt-6">
                      <FinishOrderButton />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <aside className="lg:col-span-4">
              <div className="sticky top-24">
                <CartSummary
                  subtotalInCents={cartTotalInCents}
                  totalInCents={cartTotalInCents}
                  products={cart.items.map((item) => ({
                    id: item.productVariant.id,
                    name: item.productVariant.product.name,
                    variantName: item.productVariant.name,
                    sizeLabel: item.size?.size ?? null,
                    quantity: item.quantity,
                    priceInCents: item.productVariant.priceInCents,
                    imageUrl: item.productVariant.imageUrl,
                  }))}
                  title="Seu pedido"
                  editUrl="/cart/confirmation"
                />
              </div>
            </aside>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PaymentPage;
