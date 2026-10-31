import { FileText, Shuffle } from "lucide-react";
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
import { AtualizarAoVivo } from "@/components/partidas/atualizar-ao-vivo";
import { chaveamentoProjetado } from "@/lib/chaveamento";
import { TimesInscritos } from "@/components/times/times-inscritos";

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

  const [linhasGeral, partidasMataMata, timesInscritos] = await Promise.all([
    categoriaId && !isGruposMataMata ? getClassificacao(tenant.id, categoriaId) : Promise.resolve([]),
    categoriaId && isGruposMataMata
      ? db.partida.findMany({
          where: { categoriaId, fase: { not: "GRUPOS" } },
          orderBy: { dataHora: "asc" },
          include: { timeCasa: { select: { nome: true } }, timeFora: { select: { nome: true } } },
        })
      : Promise.resolve([]),
    // Elenco público: só nome, número, posição e foto (o resto fica no perfil do atleta).
    categoriaId
      ? db.time.findMany({
          where: { categoriaId },
          orderBy: { nome: "asc" },
          select: {
            id: true,
            nome: true,
            escudoUrl: true,
            atletas: {
              orderBy: { numero: "asc" },
              select: { id: true, nome: true, apelido: true, numero: true, posicao: true, fotoUrl: true },
            },
          },
        })
      : Promise.resolve([]),
  ]);

  // O admin cria os grupos antes de distribuir os times: grupo vazio ainda não
  // foi sorteado e não aparece (sem nenhum, a página mostra o aviso de sorteio).
  const linhasPorGrupo = isGruposMataMata
    ? await Promise.all(
        (categoria?.grupos ?? []).filter((g) => g.times.length > 0).map(async (g) => ({
          grupo: g,
          linhas: await getClassificacao(tenant.id, categoriaId!, {
            timeIds: g.times.map((t) => t.id),
            apenasFaseGrupos: true,
            incluirAoVivo: true,
          }),
        }))
      )
    : [];

  // Chave projetada pela classificação do momento; os jogos ao vivo entram
  // com o placar atual e a página se atualiza sozinha enquanto rolam.
  const [aoVivo, gruposPendentes] =
    isGruposMataMata && categoriaId
      ? await Promise.all([
          db.partida.count({ where: { categoriaId, status: "AO_VIVO" } }),
          db.partida.count({ where: { categoriaId, fase: "GRUPOS", status: { not: "ENCERRADA" } } }),
        ])
      : [0, 0];
  const projecao =
    categoria && linhasPorGrupo.length > 0
      ? chaveamentoProjetado(
          categoria.nome,
          linhasPorGrupo.map((g) => g.linhas)
        )
      : null;

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
          <AtualizarAoVivo ativo={aoVivo > 0} />
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
                  <div className="flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm">
                    <Shuffle size={18} aria-hidden className="mt-0.5 shrink-0 text-warning" />
                    <p>
                      <span className="font-semibold">Os grupos ainda não foram sorteados.</span>{" "}
                      <span className="text-muted">Abaixo estão os times já inscritos nesta categoria.</span>
                    </p>
                  </div>
                )}
              </div>

              {linhasPorGrupo.length > 0 && (
                <div>
                  <h2 className="mb-1 font-semibold">Mata-mata</h2>
                  {projecao && (
                    <p className="mb-2 text-xs text-muted">
                      {aoVivo > 0
                        ? "Atualizando ao vivo: a chave muda com o placar dos jogos em andamento."
                        : gruposPendentes > 0
                          ? "Provisório: confrontos se a fase de grupos terminasse agora."
                          : "Classificados definidos pela fase de grupos."}
                    </p>
                  )}
                  <BracketView partidas={partidasMataMata} projecao={projecao} tenantSlug={tenantSlug} />
                </div>
              )}
            </>
          ) : (
            <StandingsTable linhas={linhasGeral} />
          )}

          <div>
            <h2 className="mb-2 font-semibold">Times inscritos</h2>
            <TimesInscritos times={timesInscritos} tenantSlug={tenantSlug} />
          </div>
        </div>
      )}
    </div>
  );
}
