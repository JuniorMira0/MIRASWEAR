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
  const [variantSaving, setVariantSaving] = useState<Record<string, boolean>>({});
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

  function ProductPreview() {
    const mainVariant = variants[0] ?? { name: '', priceInCents: 0, imageUrl: '' };
    const price = ((mainVariant.priceInCents ?? 0) / 100).toFixed(2);
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        <div className="w-full h-56 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
          {mainVariant.imageUrl ? <img src={mainVariant.imageUrl} alt={mainVariant.name} className="object-cover w-full h-full" /> : <div className="text-sm text-muted-foreground">Sem imagem</div>}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{name || 'Nome do produto'}</h3>
          <p className="text-sm text-muted-foreground">{mainVariant.name || 'Variante'}</p>
          <p className="mt-2 text-xl font-bold">R$ {price}</p>
        </div>
      </div>
    );
  }

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
      className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <input name="id" type="hidden" defaultValue={initial.id ?? ""} />
      <div className="lg:col-span-2 space-y-4">
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
            {variants.map((v, idx) => {
              const key = v.id ?? String(idx);
              return (
                <div key={key} className="p-4 border rounded-lg bg-white shadow-sm">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-50 rounded overflow-hidden flex items-center justify-center">
                      {v.imageUrl ? <img src={v.imageUrl} alt={v.name} className="object-cover w-full h-full" /> : <div className="text-sm text-muted-foreground">Sem imagem</div>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">{v.name || 'Nova variante'}</h4>
                          <div className="text-sm text-muted-foreground">Cor: {v.color || '-'}</div>
                        </div>
                        <div className="text-sm">Preço: <strong>{((v.priceInCents ?? 0) / 100).toFixed(2)}</strong></div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input value={v.name} onChange={(e) => updateVariant(idx, { ...v, name: e.target.value })} />
                        <Input value={v.color ?? ''} onChange={(e) => updateVariant(idx, { ...v, color: e.target.value })} />
                        <Input type="number" value={String(v.priceInCents ?? 0)} onChange={(e) => updateVariant(idx, { ...v, priceInCents: Number(e.target.value) })} />
                      </div>

                      <div className="mt-3">
                        <Input value={v.imageUrl ?? ''} onChange={(e) => updateVariant(idx, { ...v, imageUrl: e.target.value })} />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="mb-2">Tamanhos</Label>
                    {v.sizes && v.sizes.length > 0 ? (
                      <table className="w-full text-sm table-fixed">
                        <thead>
                          <tr className="text-left">
                            <th className="w-2/3">Tamanho</th>
                            <th className="w-1/3">Quantidade</th>
                            <th />
                          </tr>
                        </thead>
                        <tbody>
                          {v.sizes.map((s, si) => (
                            <tr key={si} className="border-t">
                              <td className="py-2">
                                <Input value={s.size} onChange={(e) => {
                                  const next = (v.sizes || []).map((it, i) => i === si ? { ...it, size: e.target.value } : it);
                                  updateVariant(idx, { ...v, sizes: next });
                                }} />
                              </td>
                              <td className="py-2">
                                <Input type="number" value={String(s.quantity)} onChange={(e) => {
                                  const next = (v.sizes || []).map((it, i) => i === si ? { ...it, quantity: Number(e.target.value) } : it);
                                  updateVariant(idx, { ...v, sizes: next });
                                }} />
                              </td>
                              <td className="py-2">
                                <Button type="button" variant="destructive" onClick={() => {
                                  const next = (v.sizes || []).filter((_, i) => i !== si);
                                  updateVariant(idx, { ...v, sizes: next });
                                }}>Remover</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Label>Estoque</Label>
                        <Input type="number" value={String(v.stock ?? 0)} onChange={(e) => updateVariant(idx, { ...v, stock: Number(e.target.value) })} />
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button type="button" variant="destructive" onClick={() => removeVariant(idx)}>Remover variante</Button>
                      <Button type="button" disabled={!!variantSaving[key]} onClick={async () => {
                        try {
                          if (!v.id) {
                            toast.error('Salve o produto primeiro para criar/atualizar variantes.');
                            return;
                          }
                          setVariantSaving((s) => ({ ...s, [key]: true }));

                          const body: any = { id: v.id, name: v.name, color: v.color, priceInCents: v.priceInCents, imageUrl: v.imageUrl };
                          if (v.sizes && v.sizes.length > 0) body.sizes = v.sizes.map((s) => ({ size: s.size, quantity: s.quantity }));
                          else body.stock = v.stock ?? 0;

                          const res = await fetch('/api/admin/update-variant', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                          const json = await res.json();
                          if (!res.ok || !json.ok) throw new Error(json.error || 'Erro ao salvar variante');

                          if (v.sizes && v.sizes.length > 0) updateVariant(idx, { ...v, sizes: v.sizes.map((s) => ({ ...s })) });
                          else updateVariant(idx, { ...v, stock: body.stock });

                          toast.success('Variante salva');
                        } catch (err) {
                          const msg = (err as any)?.message ?? String(err);
                          toast.error(`Erro ao salvar variante: ${msg}`);
                        } finally {
                          setVariantSaving((s) => ({ ...s, [key]: false }));
                        }
                      }}>Salvar variante</Button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div>
              <Button type="button" onClick={addVariant}>Adicionar variante</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:col-span-1">
        <ProductPreview />
        <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

        <div className="mt-4">
          <LoadingButton isLoading={submitting} type="submit">Salvar</LoadingButton>
        </div>
      </div>
    </form>
  );
}
