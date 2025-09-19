"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingButton } from "@/components/ui/loading-button";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

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
  const [localCategories, setLocalCategories] = useState<{ id: string; name: string }[]>(categories ?? []);

  const [variants, setVariants] = useState<Variant[]>(initial.variants ?? []);
  const [variantSaving, setVariantSaving] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<string[]>([]);
  const [previewVariantIndex, setPreviewVariantIndex] = useState<number>(0);
  const [newSizeInputs, setNewSizeInputs] = useState<Record<number, { size: string; quantity: number }>>({});

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
      setCreateCategoryName('');
      if (json && json.id && json.name) {
        setLocalCategories((s) => [...s, { id: json.id, name: json.name }]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`Erro ao criar categoria: ${msg}`);
      setErrors((s) => [...s, 'Erro ao criar categoria']);
    } finally {
      setCreatingCategory(false);
    }
  };

  function ProductPreview() {
    const mainVariant = variants[previewVariantIndex] ?? variants[0] ?? { name: '', priceInCents: 0, imageUrl: '' };
    const price = formatCurrency(mainVariant.priceInCents ?? 0);
    return (
      <div className="p-4 border rounded-lg bg-white shadow-sm">
        {variants && variants.length > 0 && (
          <div className="mb-3">
            <label className="block text-sm text-muted-foreground mb-1">Visualizar variante</label>
            <select className="input w-full" value={String(previewVariantIndex)} onChange={(e) => setPreviewVariantIndex(Number(e.target.value))}>
              {variants.map((v, i) => (
                <option key={v.id ?? i} value={i}>{v.name || `Variante ${i + 1}`}</option>
              ))}
            </select>
          </div>
        )}
        <div className="w-full h-56 bg-gray-50 rounded overflow-hidden flex items-center justify-center relative">
          {mainVariant.imageUrl ? <img src={mainVariant.imageUrl} alt={mainVariant.name} className="object-cover w-full h-full" /> : <div className="text-sm text-muted-foreground">Sem imagem</div>}
          {(mainVariant.stock ?? 0) <= 0 && <div className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 rounded">Sem estoque</div>}
        </div>
        <div className="mt-4">
          <h3 className="text-lg font-semibold">{name || 'Nome do produto'}</h3>
          <p className="text-sm text-muted-foreground">{mainVariant.name || 'Variante'}</p>
          <p className="mt-2 text-xl font-bold">{price}</p>
          {variants.length > 1 && (
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {variants.map((v, i) => (
                <button key={v.id ?? i} type="button" onClick={() => setPreviewVariantIndex(i)} className={`w-14 h-14 rounded overflow-hidden border ${i === previewVariantIndex ? 'ring-2 ring-primary' : ''}`}>
                  {v.imageUrl ? <img src={v.imageUrl} className="object-cover w-full h-full" /> : <div className="flex items-center justify-center w-full h-full text-xs text-muted-foreground">No</div>}
                </button>
              ))}
            </div>
          )}
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
          toast.success('Produto salvo com sucesso');
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
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        <input name="id" type="hidden" defaultValue={initial.id ?? ""} />
      <div className="lg:col-span-2 space-y-4">
        <div>
          <Label>Nome <span className="text-red-500">*</span></Label>
          <Input name="name" value={name} onChange={(e) => setName(e.target.value)} aria-label="Nome do produto" placeholder="Ex: Tênis Esportivo Modelo X" />
          
        </div>

        <div>
          <Label>Slug <span className="text-red-500">*</span></Label>
          <div className="p-2 bg-gray-50 rounded text-sm text-muted-foreground">{slug || '—'}</div>
          <input type="hidden" name="slug" value={slug} />
        </div>

        <div>
          <Label>Descrição <span className="text-red-500">*</span></Label>
          <textarea name="description" value={description} onChange={(e) => setDescription(e.target.value)} className="textarea" aria-label="Descrição do produto" rows={5} placeholder="Descreva o produto: material, ajuste, recomendações de uso, etc." />
          
        </div>

        <div>
          <label className="block">Categoria</label>
          <select name="categoryId" value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="input">
            <option value="">-- Selecione uma categoria --</option>
            {localCategories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
            <option value="__other__">Outra...</option>
          </select>

          {categoryId === '__other__' && (
            <div className="mt-2 flex gap-2">
              <Input placeholder="Criar nova categoria" value={createCategoryName} onChange={(e) => setCreateCategoryName(e.target.value)} aria-label="Nome nova categoria" />
              <Button type="button" disabled={creatingCategory} onClick={onCreateCategory}>{creatingCategory ? 'Criando...' : 'Criar'}</Button>
            </div>
          )}
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
                        <div>
                          <Label className="sr-only">Nome variante</Label>
                          <Input value={v.name} onChange={(e) => updateVariant(idx, { ...v, name: e.target.value })} placeholder="Nome da variante (ex: Branco)" />
                          
                        </div>

                        <div>
                          <Label className="sr-only">Cor</Label>
                          <Input value={v.color ?? ''} onChange={(e) => updateVariant(idx, { ...v, color: e.target.value })} placeholder="Cor (ex: Branco)" />
                          
                        </div>

                        <div>
                          <Label className="sr-only">Preço (centavos)</Label>
                          <Input type="number" value={String(v.priceInCents ?? 0)} onChange={(e) => updateVariant(idx, { ...v, priceInCents: Number(e.target.value) })} placeholder="Preço em centavos (ex: 1999)" />
                          
                        </div>
                      </div>

                      <div className="mt-3">
                        <Input value={v.imageUrl ?? ''} onChange={(e) => updateVariant(idx, { ...v, imageUrl: e.target.value })} placeholder="URL da imagem da variante" />
                        
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Label className="mb-2">Tamanhos</Label>
                    {v.sizes && v.sizes.length > 0 ? (
                      <div className="space-y-2">
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
                        <div className="flex gap-2">
                          <Input placeholder="Tamanho (ex: M)" value={newSizeInputs[idx]?.size ?? ''} onChange={(e) => setNewSizeInputs((s) => ({ ...s, [idx]: { ...(s[idx] ?? { size: '', quantity: 0 }), size: e.target.value } }))} />
                          <Input placeholder="Quantidade" type="number" value={String(newSizeInputs[idx]?.quantity ?? '')} onChange={(e) => setNewSizeInputs((s) => ({ ...s, [idx]: { ...(s[idx] ?? { size: '', quantity: 0 }), quantity: Number(e.target.value) } }))} />
                          <Button type="button" onClick={() => {
                            const input = newSizeInputs[idx] ?? { size: '', quantity: 0 };
                            if (!input.size || input.size.trim() === '') {
                              toast.error('Informe o tamanho antes de adicionar');
                              return;
                            }
                            const next = [...(v.sizes || []), { size: input.size, quantity: Number(input.quantity || 0) }];
                            updateVariant(idx, { ...v, sizes: next });
                            setNewSizeInputs((s) => ({ ...s, [idx]: { size: '', quantity: 0 } }));
                          }}>Adicionar tamanho</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Label>Estoque</Label>
                        <Input type="number" value={String(v.stock ?? 0)} onChange={(e) => updateVariant(idx, { ...v, stock: Number(e.target.value) })} />
                      </div>
                    )}

                    <div className="mt-3 flex gap-2">
                      <Button type="button" variant="destructive" onClick={() => removeVariant(idx)}>Remover variante</Button>
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

      <div className="lg:col-span-1 lg:sticky lg:top-24">
        <ProductPreview />
        <input type="hidden" name="variantsJson" value={JSON.stringify(variants)} />

        <div className="mt-4">
          <LoadingButton isLoading={submitting} type="submit">Salvar</LoadingButton>
        </div>
      </div>
    </form>
  );
}
