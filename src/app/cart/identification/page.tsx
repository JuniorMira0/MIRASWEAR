import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { Header } from "@/components/common/header";
import {
  getCartWithItems,
  getUserShippingAddresses,
} from "@/data/cart/get-cart";
import { auth } from "@/lib/auth";

import Footer from "@/components/common/footer";
import { getCategories } from "@/actions/get-categories";
import CartSummary from "../components/cart-summary";
import Addresses from "./components/addresses";

const IdentificationPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  if (!session?.user.id) {
    redirect("/authentication");
  }
  const cart = await getCartWithItems(session.user.id);
  const categories = await getCategories();

  if (!cart || cart?.items.length === 0) {
    redirect("/");
  }

  const shippingAddresses = await getUserShippingAddresses(session.user.id);

  const cartTotalInCents = cart.items.reduce(
    (acc, item) => acc + item.productVariant.priceInCents * item.quantity,
    0,
  );

  return (
    <div className="space-y-12">
  <Header categories={categories} />
      <div className="space-y-4 px-5">
        <Addresses
          shippingAddresses={shippingAddresses}
          defaultShippingAddressId={cart.shippingAddress?.id || null}
        />
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
      <Footer />
    </div>
  );
};

export default IdentificationPage;
