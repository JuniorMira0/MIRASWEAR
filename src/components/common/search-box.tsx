'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { Input } from '@/components/ui/input';
import { formatCentsToBRL } from '@/helpers/money';

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

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function SearchBox({
  inline = false,
  visible,
  onClose,
  initialQuery,
  syncQueryToUrl,
  collapsible = false,
  expandLeft = false,
}: {
  inline?: boolean;
  visible?: boolean;
  onClose?: () => void;
  initialQuery?: string;
  syncQueryToUrl?: boolean;
  collapsible?: boolean;
  expandLeft?: boolean;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQuery ?? '');
  const [open, setOpen] = useState(!collapsible);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (!q || q.trim().length < 2) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(q)}`)
        .then(r => r.json())
        .then(json => {
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
        const el = containerRef.current?.querySelector<HTMLInputElement>('input');
        el?.focus();
      }, 50);
    }
    // focus overlay input when it opens
    if (open && inputRef.current) {
      inputRef.current.focus();
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
      if (e.key === 'Escape') onClose?.();
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [inline, onClose]);

  const content = (
    <div ref={containerRef} className="max-w-full">
      <div className={`transform transition-all duration-200 ${inline ? 'w-[360px]' : 'w-full'}`}>
        <div className="flex items-center gap-2">
          {collapsible ? (
            // collapsed mode: show only the icon; when open, render the input as an absolute overlay
            <div
              className={`relative flex items-center ${expandLeft ? 'justify-end' : ''}`}
              onMouseEnter={() => {
                if (collapsible) setOpen(true);
              }}
              onMouseLeave={() => {
                if (collapsible) setOpen(false);
              }}
            >
              <div className={`flex items-center`}>
                <button
                  aria-label="Abrir busca"
                  onClick={() => setOpen(s => !s)}
                  className="p-1 focus:outline-none"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`h-5 w-5 transition-all ${open ? 'text-blue-500' : 'text-gray-400'}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>

              {open && (
                <div
                  className={`absolute top-0 ${expandLeft ? 'right-0' : 'left-0'} z-30`}
                  style={{ transform: 'translateY(-4px)' }}
                >
                  <Input
                    ref={(el: HTMLInputElement) => {
                      inputRef.current = el;
                    }}
                    placeholder="Buscar produtos..."
                    value={q}
                    className={`w-64 border-blue-500`}
                    onChange={e => setQ(e.target.value)}
                    onKeyDown={e => {
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
              )}
            </div>
          ) : (
            <Input
              placeholder="Buscar produtos..."
              value={q}
              className="w-full"
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => {
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
          )}
        </div>
        <div className="mt-3">
          {loading && <div className="text-muted-foreground text-sm">Buscando...</div>}
          {!loading && results.length === 0 && q.trim().length >= 2 && (
            <div className="text-muted-foreground text-sm">Nenhum resultado</div>
          )}
          <ul className="mt-2 space-y-2">
            {results.map(r => {
              const href = r.variantSlug
                ? `/product-variant/${r.variantSlug}`
                : r.productSlug
                  ? `/product/${r.productSlug}`
                  : '#';
              return (
                <li key={r.id}>
                  <Link
                    href={href}
                    className="group flex items-center gap-3 rounded p-2 hover:bg-gray-50"
                  >
                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                      {r.imageUrl ? (
                        <Image
                          src={r.imageUrl}
                          alt={r.variantName ?? r.productName ?? r.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">
                        {r.productName ?? r.variantName ?? r.name}
                      </div>
                      {r.variantName ? (
                        <div className="text-muted-foreground text-xs">{r.variantName}</div>
                      ) : typeof r.priceInCents === 'number' ? (
                        <div className="text-muted-foreground text-xs">
                          {formatCentsToBRL(r.priceInCents)}
                        </div>
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
