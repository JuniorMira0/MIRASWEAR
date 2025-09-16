"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

type VariantSize = { size: string; quantity: number };
type Variant = { id?: string; name: string; slug?: string; color?: string; priceInCents: number; imageUrl?: string; sizes?: VariantSize[]; stock?: number };

type Props = {
  initial?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    categoryId?: string | null;
    variants?: Variant[];
  };
  categories?: { id: string; name: string }[];
  onSubmit: (form: FormData) => Promise<any>;
};

export default function ProductForm({ initial = {}, categories = [], onSubmit }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(initial.name ?? "");
  const [slug, setSlug] = useState(initial.slug ?? "");
  const [description, setDescription] = useState(initial.description ?? "");
  const [categoryId, setCategoryId] = useState(initial.categoryId ?? "");
  const [createCategoryName, setCreateCategoryName] = useState("");
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [variants, setVariants] = useState<Variant[]>(initial.variants ?? []);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    // suggest slug from name
    if (!initial.slug) {
      setSlug(
        name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .trim(),
      );
    }
  }, [name]);

  const addVariant = () => setVariants((s) => [...s, { name: "", priceInCents: 0, sizes: [], stock: 0 }]);
  const removeVariant = (idx: number) => setVariants((s) => s.filter((_, i) => i !== idx));
  const updateVariant = (idx: number, v: Variant) => setVariants((s) => s.map((it, i) => (i === idx ? v : it)));

  const onCreateCategory = async () => {
    if (!createCategoryName) return;
    setCreatingCategory(true);
    try {
      const res = await fetch('/api/admin/create-category', {
        method: 'POST',
        body: JSON.stringify({ name: createCategoryName, slug: createCategoryName.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim() }),
        headers: { 'Content-Type': 'application/json' },
      });
  if (!res.ok) throw new Error('Falha ao criar categoria');
      const json = await res.json();
      setCategoryId(json.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Erro ao criar categoria: ${msg}`);
      setErrors((s) => [...s, 'Erro ao criar categoria']);
    } finally {
      setCreatingCategory(false);
    }
  };

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        if (submitting) return;
        setSubmitting(true);
        // client-side validation
        const nextErrors: string[] = [];
  if (!name.trim()) nextErrors.push('Nome do produto é obrigatório');
  if (!slug.trim()) nextErrors.push('Slug do produto é obrigatório');
  if (!description || !description.trim()) nextErrors.push('Descrição do produto é obrigatória');
  if (!categoryId || !categoryId.trim()) nextErrors.push('Categoria é obrigatória');
  if (!variants || variants.length === 0) nextErrors.push('Adicione ao menos uma variante');

        variants.forEach((v, vi) => {
          if (!v.name || !v.name.trim()) nextErrors.push(`Variante #${vi + 1}: nome é obrigatório`);
          if (!v.color || !v.color.trim()) nextErrors.push(`Variante "${v.name || vi + 1}": cor é obrigatória`);
          if (v.priceInCents == null || Number.isNaN(v.priceInCents) || v.priceInCents < 0) nextErrors.push(`Variante "${v.name || vi + 1}": preço inválido`);
          if (!v.imageUrl || !v.imageUrl.trim()) nextErrors.push(`Variante "${v.name || vi + 1}": imagem (URL) é obrigatória`);
          if (v.sizes && v.sizes.length > 0) {
            v.sizes.forEach((s, si) => {
              if (!s.size || !s.size.trim()) nextErrors.push(`Variante "${v.name || vi + 1}" tamanho #${si + 1}: tamanho é obrigatório`);
              if (s.quantity == null || Number.isNaN(s.quantity) || s.quantity < 0) nextErrors.push(`Variante "${v.name || vi + 1}" tamanho "${s.size}": quantidade inválida`);
            });
          } else {
            if (v.stock == null || Number.isNaN(v.stock) || v.stock < 0) nextErrors.push(`Variante "${v.name || vi + 1}": informe estoque ou adicione tamanhos`);
          }
        });

        if (nextErrors.length > 0) {
          setErrors(nextErrors);
          toast.error('Corrija os erros do formulário e tente novamente');
          setSubmitting(false);
          return;
        }

        setErrors([]);

        const fd = new FormData(e.currentTarget as HTMLFormElement);
        fd.set('variantsJson', JSON.stringify(variants));

        try {
          await onSubmit(fd);
        } catch (err: unknown) {
          try {
            const maybeMsg = (err as any)?.message ?? String(err);
            if (maybeMsg === 'NEXT_REDIRECT') throw err;
          } catch (re) {
            throw re;
          }

          const serverMsg = (err as any)?.message ?? String(err);
          toast.error(`Erro ao salvar produto: ${serverMsg}`);
          setErrors((s) => [...s, 'Erro ao salvar produto — ver console para detalhes']);
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <input name="id" type="hidden" defaultValue={initial.id ?? ""} />

      <div>
        <Label>Nome <span className="text-red-500">*</span></Label>
        <Input name="name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome do produto" />
      </div>

      <div>
        <Label>Slug (sugerido) <span className="text-red-500">*</span></Label>
        <Input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} aria-label="Slug do produto" />
      </div>

      <div>
        <Label>Descrição <span className="text-red-500">*</span></Label>
        <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="textarea" aria-label="Descrição do produto" />
      </div>

      <div>
        <label className="block">Categoria</label>
        <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
          <option value="">-- Selecione uma categoria --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="mt-2 flex gap-2">
          <Input placeholder="Criar nova categoria" value={createCategoryName} onChange={(e) => setCreateCategoryName(e.target.value)} aria-label="Nome nova categoria" />
          <Button type="button" disabled={creatingCategory} onClick={onCreateCategory}>{creatingCategory ? 'Criando...' : 'Criar'}</Button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Variantes</h3>
        <div className="space-y-3">
          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-3 rounded">
              <strong>Erros:</strong>
              <ul className="mt-2 list-disc list-inside">
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          {variants.map((v, idx) => (
            <div key={idx} className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <Label>Nome variante</Label>
                  <Input value={v.name} onChange={(e) => updateVariant(idx, { ...v, name: e.target.value })} />
                </div>
                <div>
                  <Label>Cor <span className="text-red-500">*</span></Label>
                  <Input value={v.color ?? ''} onChange={(e) => updateVariant(idx, { ...v, color: e.target.value })} />
                </div>
                <div>
                  <Label>Preço (centavos)</Label>
                  <Input type="number" value={String(v.priceInCents ?? 0)} onChange={(e) => updateVariant(idx, { ...v, priceInCents: Number(e.target.value) })} />
                </div>
              </div>
              <div className="mt-2">
                <Label>Imagem (URL) <span className="text-red-500">*</span></Label>
                <Input value={v.imageUrl ?? ''} onChange={(e) => updateVariant(idx, { ...v, imageUrl: e.target.value })} />
              </div>

              <div className="mt-2">
                <label>Tamanhos</label>
                <div className="space-y-2">
                  {(v.sizes || []).map((s, si) => (
                      <div key={si} className="flex gap-2">
                        <Input placeholder="Tamanho" value={s.size} onChange={(e) => {
                          const next = (v.sizes || []).map((it, i) => i === si ? { ...it, size: e.target.value } : it);
                          updateVariant(idx, { ...v, sizes: next });
                        }} />
                        <Input placeholder="Quantidade" type="number" value={s.quantity} onChange={(e) => {
                          const next = (v.sizes || []).map((it, i) => i === si ? { ...it, quantity: Number(e.target.value) } : it);
                          updateVariant(idx, { ...v, sizes: next });
                        }} />
                        <Button type="button" variant="destructive" onClick={() => {
                          const next = (v.sizes || []).filter((_, i) => i !== si);
                          updateVariant(idx, { ...v, sizes: next });
                        }}>Remover</Button>
                      </div>
                  ))}
                  <Button type="button" onClick={() => {
                    const next = [...(v.sizes || []), { size: '', quantity: 0 }];
                    updateVariant(idx, { ...v, sizes: next });
                  }}>Adicionar tamanho</Button>
                  <div className="mt-2">
                    <Label>Estoque (se não usar tamanhos)</Label>
                    <Input type="number" value={String(v.stock ?? 0)} onChange={(e) => updateVariant(idx, { ...v, stock: Number(e.target.value) })} />
                    <p className="text-sm text-muted-foreground mt-1">Informe estoque por variante somente se não estiver usando tamanhos</p>
                  </div>
                </div>
              </div>

              <div className="mt-2">
                <div className="flex gap-2">
                  <Button type="button" variant="destructive" onClick={() => removeVariant(idx)}>Remover variante</Button>
                  <Button type="button" onClick={async () => {
                    try {
                      const body = {
                        id: v.id,
                        name: v.name,
                        color: v.color,
                        priceInCents: v.priceInCents,
                        imageUrl: v.imageUrl,
                      };
                      const res = await fetch('/api/admin/update-variant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                      const json = await res.json();
                      if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao salvar variante');
                      toast.success('Variante salva');
                    } catch (err) {
                      const msg = (err as any)?.message ?? String(err);
                      toast.error(`Erro ao salvar variante: ${msg}`);
                    }
                  }}>Salvar variante</Button>
                </div>
              </div>
            </div>
          ))}
          <div>
            <Button type="button" onClick={addVariant}>Adicionar variante</Button>
          </div>
        </div>
      </div>

      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      <div>
        <LoadingButton isLoading={submitting} type="submit">Salvar</LoadingButton>
      </div>
    </form>
  );
}
