"use client";

import { useEffect, useState } from "react";

type VariantSize = { size: string; quantity: number };
type Variant = { name: string; slug?: string; color?: string; priceInCents: number; imageUrl?: string; sizes?: VariantSize[] };

type Props = {
  initial?: {
    id?: string;
    name?: string;
    slug?: string;
    description?: string;
    categoryId?: string | null;
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

  const [variants, setVariants] = useState<Variant[]>([]);

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

  const addVariant = () => setVariants((s) => [...s, { name: "", priceInCents: 0, sizes: [] }]);
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
      console.error(err);
      alert('Erro ao criar categoria');
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

        const fd = new FormData(e.currentTarget as HTMLFormElement);
        fd.set('variantsJson', JSON.stringify(variants));

        try {
          await onSubmit(fd);
        } catch (err) {
          console.error(err);
          alert('Erro ao salvar produto');
        } finally {
          setSubmitting(false);
        }
      }}
      className="space-y-4"
    >
      <input name="id" type="hidden" defaultValue={initial.id ?? ""} />

      <div>
        <label className="block">Nome</label>
        <input name="name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
      </div>

      <div>
        <label className="block">Slug (sugerido)</label>
        <input name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} className="input" />
      </div>

      <div>
        <label className="block">Descrição</label>
        <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="textarea" />
      </div>

      <div>
        <label className="block">Categoria</label>
        <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
          <option value="">-- Selecione uma categoria --</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <div className="mt-2">
          <input placeholder="Criar nova categoria" value={createCategoryName} onChange={(e) => setCreateCategoryName(e.target.value)} className="input inline" />
          <button type="button" disabled={creatingCategory} onClick={onCreateCategory} className="btn">Criar</button>
        </div>
      </div>

      <div>
        <h3 className="font-semibold">Variantes</h3>
        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div key={idx} className="p-3 border rounded">
              <div className="flex justify-between items-center">
                <div>
                  <label>Nome variante</label>
                  <input value={v.name} onChange={(e) => updateVariant(idx, { ...v, name: e.target.value })} className="input" />
                </div>
                <div>
                  <label>Cor</label>
                  <input value={v.color ?? ''} onChange={(e) => updateVariant(idx, { ...v, color: e.target.value })} className="input" />
                </div>
                <div>
                  <label>Preço (centavos)</label>
                  <input type="number" value={v.priceInCents} onChange={(e) => updateVariant(idx, { ...v, priceInCents: Number(e.target.value) })} className="input" />
                </div>
              </div>
              <div className="mt-2">
                <label>Imagem (URL)</label>
                <input value={v.imageUrl ?? ''} onChange={(e) => updateVariant(idx, { ...v, imageUrl: e.target.value })} className="input" />
              </div>

              <div className="mt-2">
                <label>Tamanhos</label>
                <div className="space-y-2">
                  {(v.sizes || []).map((s, si) => (
                    <div key={si} className="flex gap-2">
                      <input placeholder="Tamanho" value={s.size} onChange={(e) => {
                        const next = (v.sizes || []).map((it, i) => i === si ? { ...it, size: e.target.value } : it);
                        updateVariant(idx, { ...v, sizes: next });
                      }} className="input" />
                      <input placeholder="Quantidade" type="number" value={s.quantity} onChange={(e) => {
                        const next = (v.sizes || []).map((it, i) => i === si ? { ...it, quantity: Number(e.target.value) } : it);
                        updateVariant(idx, { ...v, sizes: next });
                      }} className="input" />
                      <button type="button" onClick={() => {
                        const next = (v.sizes || []).filter((_, i) => i !== si);
                        updateVariant(idx, { ...v, sizes: next });
                      }} className="btn">Remover</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => {
                    const next = [...(v.sizes || []), { size: '', quantity: 0 }];
                    updateVariant(idx, { ...v, sizes: next });
                  }} className="btn">Adicionar tamanho</button>
                </div>
              </div>

              <div className="mt-2">
                <button type="button" onClick={() => removeVariant(idx)} className="btn btn-danger">Remover variante</button>
              </div>
            </div>
          ))}
          <div>
            <button type="button" onClick={addVariant} className="btn">Adicionar variante</button>
          </div>
        </div>
      </div>

      <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

      <div>
        <button className="btn" type="submit" disabled={submitting}>{submitting ? 'Salvando...' : 'Salvar'}</button>
      </div>
    </form>
  );
}
