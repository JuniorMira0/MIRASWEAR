"use client";

import { loadStripe } from "@stripe/stripe-js";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { LoadingButton } from "@/components/ui/loading-button";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";
import { toast } from "sonner";

const FinishOrderButton = () => {
  const finishOrderMutation = useFinishOrder();
  const handleFinishOrder = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error("Stripe publishable key is not set");
    }
    let orderId: string | undefined;
    try {
      const res = await finishOrderMutation.mutateAsync();
      orderId = res.orderId;
    } catch (err: unknown) {
      if (err instanceof Error) {
        try {
          const payload = JSON.parse(err.message);
          if (payload?.code === "INSUFFICIENT_STOCK") {
            const items: Array<any> = payload.items ?? [];
            const list = items
              .map(
                (it) =>
                  `${it.variantName ?? it.productVariantId} (disponível: ${it.available}, pedido: ${it.requested})`,
              )
              .join("; ");
            toast.error(`Estoque insuficiente: ${list}`);
            return;
          }
        } catch (_) {
        }
      }
      throw err;
    }
    const checkoutSession = await createCheckoutSession({
      orderId,
    });
    const stripe = await loadStripe(
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    );
    if (!stripe) {
      throw new Error("Failed to load Stripe");
    }
    await stripe.redirectToCheckout({
      sessionId: checkoutSession.id,
    });
  };
  return (
    <>
      <LoadingButton
        className="w-full rounded-full"
        size="lg"
        onClick={handleFinishOrder}
        isLoading={finishOrderMutation.isPending}
      >
        Finalizar compra
      </LoadingButton>
    </>
  );
};

export default FinishOrderButton;
