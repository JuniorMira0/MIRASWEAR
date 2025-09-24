"use client"

import { Input } from "@/components/ui/input";
import { formatCentsToBRL } from "@/helpers/money";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

type Result = {
  id: string;
  name: string;
  productName?: string | null;
  variantName?: string | null;
  productSlug?: string;
  variantSlug?: string;
  imageUrl?: string | null;
  priceInCents?: number | null;
};

import { useRouter } from 'next/navigation';

export default function SearchBox({
  inline = false,
  visible,
  onClose,
  initialQuery,
  syncQueryToUrl,
}: {
  inline?: boolean;
  visible?: boolean;
  onClose?: () => void;
  initialQuery?: string;
  syncQueryToUrl?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? "");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then((json) => {
          setResults(json.results || []);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(handler);
  }, [q]);

  useEffect(() => {
    if (typeof initialQuery === 'string' && initialQuery !== q) {
      setQ(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!syncQueryToUrl) return;
    const t = setTimeout(() => {
      const base = '/busca';
      if (!q || q.trim().length === 0) {
        router.replace(base);
      } else {
        const url = `${base}?busca=${encodeURIComponent(q)}`;
        router.replace(url);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [q, router, syncQueryToUrl]);

  useEffect(() => {
    if (!inline) return;
    if (visible) {
      setTimeout(() => {
        const el = containerRef.current?.querySelector<HTMLInputElement>("input");
        el?.focus();
      }, 50);
    }
  }, [inline]);

  useEffect(() => {
    if (!inline) return;
    function onDocClick(e: MouseEvent) {
      if (!containerRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!containerRef.current.contains(e.target)) {
        onClose?.();
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose?.();
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [inline, onClose]);

  const content = (
    <div ref={containerRef} className="max-w-full">
      <div className={`transform transition-all duration-200 ${inline ? "w-[360px]" : "w-full"}`}>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar produtos..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                if (inline) {
                  const base = '/busca';
                  const url = `${base}?busca=${encodeURIComponent(q)}`;
                  router.push(url);
                  onClose?.();
                }
              }
            }}
          />
        </div>
        <div className="mt-3">
          {loading && <div className="text-sm text-muted-foreground">Buscando...</div>}
          {!loading && results.length === 0 && q.trim().length >= 2 && <div className="text-sm text-muted-foreground">Nenhum resultado</div>}
          <ul className="mt-2 space-y-2">
            {results.map((r) => {
              const href = r.variantSlug ? `/product-variant/${r.variantSlug}` : r.productSlug ? `/product/${r.productSlug}` : "#";
              return (
                <li key={r.id}>
                  <Link href={href} className="group flex items-center gap-3 p-2 rounded hover:bg-gray-50">
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      {r.imageUrl ? (
                        <img src={r.imageUrl} alt={r.variantName ?? r.productName ?? r.name} className="h-full w-full object-cover" />
                      ) : null}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium">{r.productName ?? r.variantName ?? r.name}</div>
                      {r.variantName ? (
                        <div className="text-xs text-muted-foreground">{r.variantName}</div>
                      ) : typeof r.priceInCents === "number" ? (
                        <div className="text-xs text-muted-foreground">{formatCentsToBRL(r.priceInCents)}</div>
                      ) : null}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );

  if (inline) {
    return content;
  }
  return content;
}