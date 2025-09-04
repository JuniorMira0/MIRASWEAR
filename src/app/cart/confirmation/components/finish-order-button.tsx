"use client";

import { loadStripe } from "@stripe/stripe-js";

import { createCheckoutSession } from "@/actions/create-checkout-session";
import { LoadingButton } from "@/components/ui/loading-button";
import { useFinishOrder } from "@/hooks/mutations/use-finish-order";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const FinishOrderButton = () => {
  const finishOrderMutation = useFinishOrder();
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    const raw = (window as any).__RESERVATION_EXPIRES_AT;
    if (raw) setExpiresAt(new Date(raw));
  }, []);

  useEffect(() => {
    if (!expiresAt) return;
    const id = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((expiresAt.getTime() - Date.now()) / 1000),
      );
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const handleFinishOrder = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      throw new Error("Stripe publishable key is not set");
    }
    let orderId: string | undefined;
    try {
      const res = await finishOrderMutation.mutateAsync();
      orderId = res.orderId;
      if (res.expiresAt) {
        try {
          const d = new Date(res.expiresAt);
          setExpiresAt(d);
          (window as any).__RESERVATION_EXPIRES_AT = res.expiresAt;
        } catch {}
      }
    } catch (err: unknown) {
      let message: string | undefined;
      if (err instanceof Error) message = err.message;
      else if (typeof err === "string") message = err;
      else if (err && typeof err === "object" && "message" in err) {
        message = (err as any).message;
      }

      if (message) {
        try {
          const payload = JSON.parse(message);
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

        toast.error(message);
        return;
      }

      toast.error("Erro ao finalizar o pedido");
      return;
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
      {timeLeft !== null && timeLeft <= 0 ? (
        <div className="text-destructive text-sm font-medium">
          Reserva expirada
        </div>
      ) : (
        <LoadingButton
          className="w-full rounded-full"
          size="lg"
          onClick={handleFinishOrder}
          isLoading={finishOrderMutation.isPending}
        >
          Finalizar compra{timeLeft ? ` · ${timeLeft}s` : ""}
        </LoadingButton>
      )}
    </>
  );
};

export default FinishOrderButton;
