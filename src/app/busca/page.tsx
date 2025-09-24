import SearchBox from '@/components/common/search-box';

export default function BuscaPage({ searchParams }: { searchParams?: { busca?: string } }) {
  const initial = (searchParams?.busca as string) ?? '';
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold mb-4">Buscar produtos</h1>
      <SearchBox initialQuery={initial} syncQueryToUrl />
    </div>
  );
}
