import { getCategories } from '@/actions/get-categories';
import { Header } from '@/components/common/header';
import SearchBox from '@/components/common/search-box';

export default async function BuscaPage({ searchParams }: { searchParams?: { busca?: string } }) {
  const initial = (searchParams?.busca as string) ?? '';
  const categories = await getCategories();

  return (
    <>
      <Header categories={categories} />
      <main className="bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <h1 className="text-2xl font-semibold mb-4">Buscar produtos</h1>
          <SearchBox initialQuery={initial} syncQueryToUrl />
        </div>
      </main>
    </>
  );
}
