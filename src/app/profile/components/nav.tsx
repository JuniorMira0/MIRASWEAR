"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from 'lucide-react';

interface NavProps {
  value?: string;
  onChange?: (v: string) => void;
}

const Nav = ({ value = "orders", onChange }: NavProps) => {
  const [active, setActive] = useState<string>(value);
  const select = (v: string) => {
    setActive(v);
    onChange?.(v);
  };

  return (
    <div className="w-full max-w-[220px]">
      <div className="space-y-2">
        <button
          onClick={() => select("orders")}
          className={`w-full text-left rounded-md px-4 py-3 ${active === "orders" ? "bg-muted" : "hover:bg-muted/50"}`}
        >
          Meus pedidos
        </button>
        <button
          onClick={() => select("profile")}
          className={`w-full text-left rounded-md px-4 py-3 ${active === "profile" ? "bg-muted" : "hover:bg-muted/50"}`}
        >
          Meus dados
        </button>
        <button
          onClick={() => select("addresses")}
          className={`w-full text-left rounded-md px-4 py-3 ${active === "addresses" ? "bg-muted" : "hover:bg-muted/50"}`}
        >
          Meus endereços
        </button>
      </div>
      <div className="mt-4">
        <button
          onClick={() => authClient.signOut()}
          className="w-full text-left rounded-md px-4 py-3 text-red-600 hover:bg-muted/50"
        >
          <LogOutIcon className="h-4 w-4" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Nav;
