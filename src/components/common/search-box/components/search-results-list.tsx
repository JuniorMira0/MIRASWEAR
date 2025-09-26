import Image from 'next/image';
import Link from 'next/link';

import { formatCentsToBRL } from '@/helpers/money';

import type { Result } from '../types';

type SearchResultsListProps = {
  loading: boolean;
  query: string;
  results: Result[];
};

export function SearchResultsList({ loading, query, results }: SearchResultsListProps) {
  return (
    <div>
      {loading && <div className="text-muted-foreground text-sm">Buscando...</div>}
      {!loading && results.length === 0 && query.trim().length >= 2 && (
        <div className="text-muted-foreground text-sm">Nenhum resultado</div>
      )}
      <ul className="mt-2 space-y-2">
        {results.map(result => {
          const href = result.variantSlug
            ? `/product-variant/${result.variantSlug}`
            : result.productSlug
              ? `/product/${result.productSlug}`
              : '#';

          return (
            <li key={result.id}>
              <Link
                href={href}
                className="group flex items-center gap-3 rounded p-2 hover:bg-gray-50"
              >
                <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                  {result.imageUrl ? (
                    <Image
                      src={result.imageUrl}
                      alt={result.variantName ?? result.productName ?? result.name}
                      className="h-full w-full object-cover"
                      width={40}
                      height={40}
                      unoptimized
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {result.productName ?? result.variantName ?? result.name}
                  </div>
                  {result.variantName ? (
                    <div className="text-muted-foreground text-xs">{result.variantName}</div>
                  ) : typeof result.priceInCents === 'number' ? (
                    <div className="text-muted-foreground text-xs">
                      {formatCentsToBRL(result.priceInCents)}
                    </div>
                  ) : null}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
