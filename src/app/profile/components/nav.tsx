"use client";

import { authClient } from "@/lib/auth-client";
import { LogOutIcon } from 'lucide-react';
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from 'sonner';

interface NavProps {
  value?: string;
  onChange?: (v: string) => void;
}

const Nav = ({ value = "orders", onChange }: NavProps) => {
  const [active, setActive] = useState<string>(value);
  const [signingOut, setSigningOut] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isAdmin = Boolean((session?.user as any)?.isAdmin);

  const select = (v: string) => {
    setActive(v);
    onChange?.(v);
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await authClient.signOut();
      router.push("/");
    } catch (err) {
      toast.error("Erro ao sair");
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <div className="w-full max-w-[220px]">
      <div className="space-y-2">
        <button
          onClick={() => select("orders")}
          className={`w-full text-left rounded-md px-4 py-3 hover:cursor-pointer ${active === "orders" ? "bg-muted" : "hover:bg-muted/50"}`}
        >
          Meus pedidos
        </button>
        <button
          onClick={() => select("profile")}
          className={`w-full text-left rounded-md px-4 py-3 hover:cursor-pointer ${active === "profile" ? "bg-muted" : "hover:bg-muted/50"}`}
        >
          Meus dados
        </button>
        {isAdmin && (
          <button
            onClick={() => router.push('/dashboard')}
            className={`w-full text-left rounded-md px-4 py-3 hover:cursor-pointer ${active === "dashboard" ? "bg-muted" : "hover:bg-muted/50"}`}
          >
            Dashboard
          </button>
        )}
        <button
          onClick={() => select("addresses")}
          className={`w-full text-left rounded-md px-4 py-3 hover:cursor-pointer ${active === "addresses" ? "bg-muted" : "hover:bg-muted/50"}`}
        >
          Meus endereços
        </button>
      </div>
      <div className="mt-4">
        <button
          onClick={handleSignOut}
          className="w-full rounded-md px-4 py-3 hover:bg-muted/50 disabled:opacity-60 hover:cursor-pointer disabled:cursor-not-allowed"
          disabled={signingOut}
        >
          <div className="flex items-center gap-3 text-red-600">
            <LogOutIcon className="h-5 w-5" />
            <span className="text-base font-medium">{signingOut ? "Saindo..." : "Sair"}</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Nav;
