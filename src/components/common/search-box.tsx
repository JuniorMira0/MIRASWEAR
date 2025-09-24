"use client"

import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string; slug: string }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      if (!q || q.trim().length < 2) {
        setResults([]);
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
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div>
      <Input placeholder="Buscar produtos..." value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="mt-3">
        {loading && <div className="text-sm text-muted-foreground">Buscando...</div>}
        {!loading && results.length === 0 && q.trim().length >= 2 && <div className="text-sm text-muted-foreground">Nenhum resultado</div>}
        <ul className="mt-2 space-y-2">
          {results.map((r) => (
            <li key={r.id}>
              <Link href={`/product/${r.slug}`} className="block p-2 rounded hover:bg-gray-50">{r.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}