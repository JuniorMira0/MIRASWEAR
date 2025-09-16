"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function DeleteProductButton(props: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <button
      className="ml-3 text-sm text-red-600 hover:underline"
      disabled={loading}
      onClick={async () => {
        if (!confirm('Tem certeza que deseja remover este produto? Esta ação é irreversível.')) return;
        setLoading(true);
        try {
          const res = await fetch('/api/admin/delete-product', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: props.id }) });
          const json = await res.json();
          if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao remover produto');
          router.push('/dashboard/products');
        } catch (err) {
          const msg = (err as any)?.message ?? String(err);
          alert(`Erro ao remover produto: ${msg}`);
        } finally {
          setLoading(false);
        }
      }}
    >
      {loading ? 'Removendo...' : 'Remover produto'}
    </button>
  );
}
