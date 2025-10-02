import ProductItem, { type ProductItemProduct } from '@/components/common/product-item';

type SearchResultsListProps = {
  loading: boolean;
  query: string;
  results: ProductItemProduct[];
};

export function SearchResultsList({ loading, query, results }: SearchResultsListProps) {
  const trimmed = query.trim();
  const products = results.filter(
    product => Array.isArray(product.variants) && product.variants.length > 0,
  );

  const shouldShowEmpty = !loading && trimmed.length >= 2 && products.length === 0;

  return (
    <div>
      {loading && <div className="text-muted-foreground text-sm">Buscando...</div>}
      {shouldShowEmpty && <div className="text-muted-foreground text-sm">Nenhum resultado</div>}
      {!shouldShowEmpty && products.length > 0 ? (
        <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {products.map(product => (
            <ProductItem key={product.id} product={product} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
