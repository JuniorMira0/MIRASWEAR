"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

const ProfileForm = ({ initial }: { initial?: { name?: string; email?: string } }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    alert("Dados salvos (simulação)");
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-semibold">Meus dados</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileForm;
