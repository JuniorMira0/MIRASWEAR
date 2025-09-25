'use client';

import { useState } from 'react';
import { toast } from 'sonner';

export default function ActiveCheckbox({ id, initial }: { id: string; initial: boolean }) {
  const [checked, setChecked] = useState(initial);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    try {
      const newState = !checked;
      const res = await fetch('/api/admin/set-product-active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, active: newState }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao atualizar');
      setChecked(newState);
      toast.success(`Produto ${newState ? 'ativado' : 'desativado'} com sucesso`);
    } catch (err) {
      const msg = (err as any)?.message ?? String(err);
      toast.error(`Erro ao atualizar produto: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <label className="flex items-center gap-2">
      <input type="checkbox" checked={checked} disabled={loading} onChange={toggle} />
      <span className="text-muted-foreground text-sm">Ativo</span>
    </label>
  );
}
