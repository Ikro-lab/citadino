import { FileText } from "lucide-react";
import { resolveCategoriaId } from "@/lib/categorias";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
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
      <PageHeader
        title="Classificação"
        action={
          regulamentoUrl && (
            <a
              href={regulamentoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-accent hover:bg-accent-soft"
            >
              <FileText size={16} />
              Regulamento
            </a>
          )
        }
      />

      {categorias.length === 0 ? (
        <EmptyState>Nenhum campeonato ativo no momento.</EmptyState>
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
                  <EmptyState>Os grupos desta categoria ainda não foram definidos.</EmptyState>
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
