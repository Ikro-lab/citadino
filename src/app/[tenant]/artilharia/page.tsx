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

export default async function ArtilhariaPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ categoria?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const sp = await searchParams;
  const { categoriaId, categorias } = await resolveCategoriaId(tenant.id, sp.categoria);

  const linhas = categoriaId ? await getArtilharia(tenant.id, categoriaId) : [];

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
                {linhas.map((l, i) => (
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
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
