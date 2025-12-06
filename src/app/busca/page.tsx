import { getCategories } from '@/actions/get-categories';
import { Header } from '@/components/common/header';
import SearchBox from '@/components/common/search-box';

type BuscaPageProps = {
  searchParams?: Promise<{
    busca?: string;
  }>;
};

export default async function BuscaPage({ searchParams }: BuscaPageProps) {
  const params = await searchParams;
  const initial = params?.busca ?? '';
  const categories = await getCategories();

  return (
    <>
      <Header categories={categories} />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="mb-4 text-2xl font-semibold">Buscar produtos</h1>
          {initial ? (
            <SearchBox inline initialQuery={initial} hideInput />
          ) : (
            <p className="text-muted-foreground text-sm">
              Use o campo de busca no topo para encontrar produtos.
            </p>
          )}
        </div>
      </main>
    </>
  );
}
