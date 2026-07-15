import { resolveCategoriaId } from "@/lib/categorias";
import { getClassificacao } from "@/lib/classificacao";
import { CategoriaTabs } from "@/components/partidas/categoria-tabs";
import { StandingsTable } from "@/components/partidas/standings-table";

export default async function ClassificacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const sp = await searchParams;
  const { categoriaId, categorias } = await resolveCategoriaId(sp.categoria);

  const linhas = categoriaId ? await getClassificacao(categoriaId) : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Classificação</h1>

      {categorias.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Nenhum campeonato ativo no momento.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <CategoriaTabs
            categorias={categorias}
            categoriaId={categoriaId}
            basePath="/classificacao"
          />
          <StandingsTable linhas={linhas} />
        </div>
      )}
    </div>
  );
}
