import { resolveCategoriaId } from "@/lib/categorias";
import { getClassificacao } from "@/lib/classificacao";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { CategoriaTabs } from "@/components/partidas/categoria-tabs";
import { StandingsTable } from "@/components/partidas/standings-table";
import { BracketView } from "@/components/partidas/bracket-view";

export default async function ClassificacaoPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);
  const sp = await searchParams;
  const { categoriaId, categorias } = await resolveCategoriaId(tenant.id, sp.categoria);

  const categoria = categoriaId
    ? await db.categoria.findUnique({
        where: { id: categoriaId },
        include: {
          grupos: { include: { times: { select: { id: true, nome: true } } } },
          campeonato: { select: { regulamentoUrl: true } },
        },
      })
    : null;

  const isGruposMataMata = categoria?.formato === "GRUPOS_MATA_MATA";

  const [linhasGeral, partidasMataMata] = await Promise.all([
    categoriaId && !isGruposMataMata ? getClassificacao(tenant.id, categoriaId) : Promise.resolve([]),
    categoriaId && isGruposMataMata
      ? db.partida.findMany({
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
          linhas: await getClassificacao(tenant.id, categoriaId!, {
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
            basePath={paths.classificacao(tenantSlug)}
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
                <BracketView partidas={partidasMataMata} tenantSlug={tenantSlug} />
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
