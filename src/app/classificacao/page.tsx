import { resolveCategoriaId } from "@/lib/categorias";
import { getClassificacao } from "@/lib/classificacao";
import { prisma } from "@/lib/prisma";
import { CategoriaTabs } from "@/components/partidas/categoria-tabs";
import { StandingsTable } from "@/components/partidas/standings-table";
import { BracketView } from "@/components/partidas/bracket-view";

export default async function ClassificacaoPage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const sp = await searchParams;
  const { categoriaId, categorias } = await resolveCategoriaId(sp.categoria);

  const categoria = categoriaId
    ? await prisma.categoria.findUnique({
        where: { id: categoriaId },
        include: {
          grupos: { include: { times: { select: { id: true, nome: true } } } },
          campeonato: { select: { regulamentoUrl: true } },
        },
      })
    : null;

  const isGruposMataMata = categoria?.formato === "GRUPOS_MATA_MATA";

  const [linhasGeral, partidasMataMata] = await Promise.all([
    categoriaId && !isGruposMataMata ? getClassificacao(categoriaId) : Promise.resolve([]),
    categoriaId && isGruposMataMata
      ? prisma.partida.findMany({
          where: { categoriaId, fase: { not: "GRUPOS" } },
          orderBy: { dataHora: "asc" },
          include: { timeCasa: { select: { nome: true } }, timeFora: { select: { nome: true } } },
        })
      : Promise.resolve([]),
  ]);

  const linhasPorGrupo = isGruposMataMata
    ? await Promise.all(
        (categoria?.grupos ?? []).map(async (g) => ({
          grupo: g,
          linhas: await getClassificacao(categoriaId!, {
            timeIds: g.times.map((t) => t.id),
            apenasFaseGrupos: true,
          }),
        }))
      )
    : [];

  const regulamentoUrl = categoria?.regulamentoUrl || categoria?.campeonato.regulamentoUrl;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Classificação</h1>
        {regulamentoUrl && (
          <a
            href={regulamentoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-accent underline"
          >
            Regulamento
          </a>
        )}
      </div>

      {categorias.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Nenhum campeonato ativo no momento.
        </p>
      ) : (
        <div className="flex flex-col gap-6">
          <CategoriaTabs
            categorias={categorias}
            categoriaId={categoriaId}
            basePath="/classificacao"
          />

          {isGruposMataMata ? (
            <>
              <div className="flex flex-col gap-6">
                {linhasPorGrupo.map(({ grupo, linhas }) => (
                  <div key={grupo.id}>
                    <h2 className="mb-2 font-semibold">{grupo.nome}</h2>
                    <StandingsTable linhas={linhas} />
                  </div>
                ))}
                {linhasPorGrupo.length === 0 && (
                  <p className="text-sm text-muted">Nenhum grupo configurado ainda.</p>
                )}
              </div>

              <div>
                <h2 className="mb-2 font-semibold">Mata-mata</h2>
                <BracketView partidas={partidasMataMata} />
              </div>
            </>
          ) : (
            <StandingsTable linhas={linhasGeral} />
          )}
        </div>
      )}
    </div>
  );
}
