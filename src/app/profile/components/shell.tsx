"use client";

import Orders from "@/app/my-orders/components/orders";
import { useEffect, useState } from "react";
import Addresses from "./addresses";
import Nav from "./nav";
import ProfileForm from "./profile-form";

type ProfileUser = {
  id?: string;
  name?: string | null;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
} | undefined;

const ProfileShell = ({ user }: { user?: ProfileUser | null }) => {
  const [tab, setTab] = useState<string>("orders");
  const [orders, setOrders] = useState<any[] | null>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoadingOrders(true);
      try {
        const res = await fetch("/api/my-orders");
        if (!res.ok) {
          if (mounted) setOrders([]);
          return;
        }
        const data = await res.json();
        if (mounted) setOrders(data);
      } catch (err) {
        if (mounted) setOrders([]);
      } finally {
        if (mounted) setLoadingOrders(false);
      }
    };

    if (tab === "orders" && orders === null) {
      load();
    }

    return () => {
      mounted = false;
    };
  }, [tab]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-3">
          <Nav value={tab} onChange={setTab} />
        </div>

        <div className="md:col-span-9">
          {tab === "orders" && (
            <div>
              <h2 className="mb-4 text-xl font-semibold">Meus pedidos</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Veja seus pedidos e acompanhe o status.
              </p>
              <div>
                {loadingOrders && <p>Carregando pedidos...</p>}
                {!loadingOrders && orders && orders.length === 0 && (
                  <p className="text-sm text-muted-foreground">Você ainda não tem pedidos.</p>
                )}
                {!loadingOrders && orders && orders.length > 0 && (
                  <Orders
                    orders={orders.map((order) => ({
                      id: order.id,
                      totalPriceInCents: order.totalPriceInCents,
                      status: order.status,
                      createdAt: new Date(order.createdAt),
                      items: order.items.map((item: any) => ({
                        id: item.id,
                        imageUrl: item.imageUrl,
                        productName: item.productName,
                        productVariantName: item.productVariantName,
                        sizeLabel: item.sizeLabel,
                        priceInCents: item.priceInCents,
                        quantity: item.quantity,
                      })),
                    }))}
                  />
                )}
                {/* orders are loaded automatically when tab is active */}
              </div>
            </div>
          )}

          {tab === "profile" && <ProfileForm initial={user ?? undefined} />}

          {tab === "addresses" && <Addresses />}
        </div>
      </div>
    </div>
  );
};

export default ProfileShell;
