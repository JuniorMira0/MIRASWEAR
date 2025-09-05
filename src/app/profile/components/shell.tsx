"use client";

import Link from "next/link";
import { useState } from "react";
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
              <Link href="/my-orders" className="text-primary">
                Ir para Meus Pedidos
              </Link>
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
