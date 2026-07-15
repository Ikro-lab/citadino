import { resolveCategoriaId } from "@/lib/categorias";
import { getFeed, todayStr } from "@/lib/partidas";
import { CategoriaTabs } from "@/components/partidas/categoria-tabs";
import { DayNav } from "@/components/partidas/day-nav";
import { FeedList } from "@/components/partidas/feed-list";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string; data?: string }>;
}) {
  const sp = await searchParams;
  const data = sp.data || todayStr();
  const { categoriaId, categorias } = await resolveCategoriaId(sp.categoria);

  const partidas = categoriaId ? await getFeed(categoriaId, data) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Partidas</h1>

      {categorias.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Nenhum campeonato ativo no momento.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <CategoriaTabs
            categorias={categorias}
            categoriaId={categoriaId}
            basePath="/"
            extraParams={{ data }}
          />

          {categoriaId && <DayNav data={data} categoriaId={categoriaId} />}

          {categoriaId && (
            <FeedList
              initialPartidas={partidas}
              categoriaId={categoriaId}
              data={data}
            />
          )}
        </div>
      )}
    </div>
  );
}
