"use client";

import { updateUser } from "@/actions/update-user";
import { Button } from "@/components/ui/button";
import { isValidBRMobilePhone } from "@/helpers/br-validators";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type ProfileInitial = {
  id?: string;
  name?: string | null;
  email?: string | null;
  cpf?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  gender?: string | null;
} | undefined;

const ProfileForm = ({ initial }: { initial?: ProfileInitial }) => {
  const [name, setName] = useState(initial?.name ?? "");
  const email = initial?.email ?? "";
  const cpf = initial?.cpf ?? "";
  const [phone, setPhone] = useState(initial?.phone ?? "");
  const [gender, setGender] = useState(initial?.gender ?? "");
  const [saving, setSaving] = useState(false);

  const router = useRouter();

  useEffect(() => {
    setName(initial?.name ?? "");
    setPhone(initial?.phone ?? "");
    setGender(initial?.gender ?? "");
  }, [initial]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // Validate phone
      if (phone && !isValidBRMobilePhone(phone)) {
        toast.error("Telefone inválido");
        setSaving(false);
        return;
      }

      // Only allow updating name, phone and gender from profile form
      await updateUser({ name, phone, gender });
      try {
        router.refresh();
      } catch {}
      toast.success("Dados atualizados com sucesso");
    } catch (e) {
      toast.error("Erro ao salvar dados");
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h2 className="mb-4 text-xl font-semibold">Meus dados</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Nome completo</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">CPF</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-50 cursor-not-allowed"
            value={cpf ?? ""}
            readOnly
            aria-readonly
            title="CPF não pode ser alterado"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Telefone</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={phone ?? ""}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Gênero</label>
          <select className="mt-1 w-full rounded-md border px-3 py-2" value={gender ?? ""} onChange={(e) => setGender(e.target.value)}>
            <option value="">Selecione</option>
            <option value="female">Feminino</option>
            <option value="male">Masculino</option>
            <option value="other">Outro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            className="mt-1 w-full rounded-md border px-3 py-2 bg-gray-50"
            value={email}
            readOnly
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
