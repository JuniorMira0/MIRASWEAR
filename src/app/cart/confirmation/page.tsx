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
import { formatAddress } from "../helpers/address";
import FinishOrderButton from "./components/finish-order-button";

const ConfirmationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.id) {
    redirect("/");
  }
  const cart = await getCartWithItems(session.user.id);
  const categories = await getCategories();

  if (!cart || cart?.items.length === 0) {
    redirect("/");
  }
  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );
  if (!cart.shippingAddress) {
    redirect("/cart/identification");
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
                        <p className="text-sm">
                          {formatAddress(cart.shippingAddress)}
                        </p>
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
                  products={cart.items.map((item) => ({
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
      <div className="mt-12">
        <Footer />
      </div>
    </div>
  );
};

export default ConfirmationPage;
