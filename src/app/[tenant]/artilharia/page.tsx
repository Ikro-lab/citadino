import Link from "next/link";
import { Goal } from "lucide-react";
import { resolveCategoriaId } from "@/lib/categorias";
import { getArtilharia } from "@/lib/artilharia";
import { getTenantBySlug } from "@/lib/tenant";
import { paths } from "@/lib/tenant-path";
import { CategoriaTabs } from "@/components/partidas/categoria-tabs";
import { CartaoIcon } from "@/components/partidas/evento-icon";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/ui/page-header";

const LIMITE_ARTILHARIA = 30;

export default async function ArtilhariaPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ categoria?: string; todos?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const sp = await searchParams;
  const { categoriaId, categorias } = await resolveCategoriaId(tenant.id, sp.categoria);

  const linhas = categoriaId ? await getArtilharia(tenant.id, categoriaId) : [];
  // A lista completa passa de 1MB no fim da temporada (~360 atletas por
  // categoria) e ocupava o servidor por ~0,4s por visita no teste de carga.
  // Por padrão só o topo; a lista inteira fica a um toque.
  const mostrarTodos = sp.todos === "1";
  const visiveis = mostrarTodos ? linhas : linhas.slice(0, LIMITE_ARTILHARIA);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader title="Artilharia" />

      {categorias.length === 0 ? (
        <EmptyState>Nenhum campeonato ativo no momento.</EmptyState>
      ) : (
        <div className="flex flex-col gap-4">
          <CategoriaTabs categorias={categorias} categoriaId={categoriaId} basePath={paths.artilharia(tenantSlug)} />

          {linhas.length === 0 ? (
            <EmptyState>Nenhum gol ou cartão registrado ainda nesta categoria.</EmptyState>
          ) : (
            <Card className="p-0">
              <ul className="divide-y divide-border">
                {visiveis.map((l, i) => (
                  <li key={l.atletaId} className="flex items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="w-5 shrink-0 text-sm font-semibold text-muted tabular-nums">{i + 1}</span>
                      <div className="min-w-0">
                        <Link
                          href={paths.atleta(tenantSlug, l.atletaId)}
                          className="block truncate text-sm font-medium hover:text-accent hover:underline"
                        >
                          {l.nome}
                        </Link>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted">
                          <span className="truncate">{l.timeNome}</span>
                          {l.statusSuspensao === "suspenso" && <Badge variant="danger">Suspenso</Badge>}
                          {l.statusSuspensao === "pendurado" && <Badge variant="accent">Pendurado</Badge>}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3 text-sm tabular-nums">
                      <span className="flex items-center gap-1 font-display text-lg font-bold">
                        <Goal size={14} aria-hidden className="text-accent" />
                        {l.gols}
                        <span className="sr-only">gols</span>
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <CartaoIcon cor="amarelo" />
                        {l.amarelos}
                        <span className="sr-only">cartões amarelos</span>
                      </span>
                      <span className="flex items-center gap-1 text-muted">
                        <CartaoIcon cor="vermelho" />
                        {l.vermelhos}
                        <span className="sr-only">cartões vermelhos</span>
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {visiveis.length < linhas.length && (
                <Link
                  href={`${paths.artilharia(tenantSlug)}?${new URLSearchParams({ categoria: categoriaId!, todos: "1" })}`}
                  className="block border-t border-border px-4 py-3 text-center text-sm font-semibold text-accent hover:bg-accent-soft"
                >
                  Ver todos ({linhas.length})
                </Link>
              )}
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
