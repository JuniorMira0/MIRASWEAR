"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function CancelClient({
  expiresAt,
}: {
  expiresAt?: string | null;
}) {
  const [expiry, setExpiry] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  useEffect(() => {
    if (expiresAt) {
      setExpiry(new Date(expiresAt));
    } else {
      const raw = (window as any).__RESERVATION_EXPIRES_AT;
      if (raw) setExpiry(new Date(raw));
    }
  }, [expiresAt]);

  useEffect(() => {
    if (!expiry) return;
    const id = setInterval(() => {
      const diff = Math.max(
        0,
        Math.floor((expiry.getTime() - Date.now()) / 1000),
      );
      setTimeLeft(diff);
    }, 1000);
    return () => clearInterval(id);
  }, [expiry]);

  return (
    <main className="bg-background flex min-h-screen items-center justify-center px-4 py-12">
      <div className="border-muted bg-card w-full max-w-xl rounded-2xl border p-8 text-center">
        <h1 className="mb-4 text-2xl font-semibold">Pedido não finalizado</h1>
        <p className="text-muted-foreground mb-6 text-sm">
          Seu pedido não foi finalizado. Sua reserva ficará disponível por um
          tempo limitado.
        </p>

        {timeLeft !== null ? (
          <div className="mb-6">
            <div className="text-muted-foreground text-sm">
              Tempo restante para finalizar
            </div>
            <div className="mt-2 text-lg font-medium">{timeLeft}s</div>
          </div>
        ) : (
          <div className="text-muted-foreground mb-6 text-sm">
            Não há uma reserva ativa.
          </div>
        )}

        <div className="flex justify-center gap-3">
          <Link
            href="/cart/confirmation"
            className="bg-primary rounded-full px-4 py-2 text-white"
          >
            Voltar ao carrinho
          </Link>
          <Link href="/" className="border-muted rounded-full border px-4 py-2">
            Continuar comprando
          </Link>
        </div>
      </div>
    </main>
  );
}
