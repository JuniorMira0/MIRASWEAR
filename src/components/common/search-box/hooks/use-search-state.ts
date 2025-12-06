import { useEffect, useState } from 'react';

import type { Result } from '../types';

const SEARCH_DEBOUNCE_MS = 300;

type UseSearchStateOptions = {
  router: RouterLike;
  initialQuery?: string;
  showResults: boolean;
  syncQueryToUrl?: boolean;
};

type RouterLike = {
  push: (href: string) => void;
  replace: (href: string) => void;
};

export function useSearchState({
  router,
  initialQuery,
  showResults,
  syncQueryToUrl,
}: UseSearchStateOptions) {
  const [query, setQuery] = useState(initialQuery ?? '');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof initialQuery === 'string') {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!syncQueryToUrl) return;

    const handler = window.setTimeout(() => {
      const value = query.trim();
      const base = '/busca';

      if (!value) {
        router.replace(base);
        return;
      }

      router.replace(`${base}?busca=${encodeURIComponent(value)}`);
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
    };
  }, [query, router, syncQueryToUrl]);

  useEffect(() => {
    if (!showResults) {
      setResults([]);
      setLoading(false);
      return;
    }

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    const handler = window.setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(trimmed)}`, { signal: controller.signal })
        .then(response => response.json())
        .then(json => {
          const nextResults = Array.isArray(json.results) ? (json.results as Result[]) : [];
          setResults(nextResults);
        })
        .catch(() => {
          if (!controller.signal.aborted) {
            setResults([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(handler);
      controller.abort();
    };
  }, [query, showResults]);

  return { query, setQuery, results, loading };
}
