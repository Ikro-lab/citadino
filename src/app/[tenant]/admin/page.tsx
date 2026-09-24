import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { PartidaListItem, acaoLinkClass } from "@/components/partidas/partida-list-item";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [proximas, aoVivo, solicitacoesPendentes, totalTimes, totalAtletas] =
    await Promise.all([
      db.partida.findMany({
        where: { status: "AGENDADA", dataHora: { gte: new Date() } },
        orderBy: { dataHora: "asc" },
        take: 5,
        include: {
          timeCasa: { select: { nome: true } },
          timeFora: { select: { nome: true } },
          categoria: { select: { nome: true } },
        },
      }),
      db.partida.findMany({
        where: { status: "AO_VIVO" },
        include: {
          timeCasa: { select: { nome: true } },
          timeFora: { select: { nome: true } },
        },
      }),
      db.solicitacaoTime.count({ where: { status: "PENDENTE" } }),
      db.time.count(),
      db.atleta.count(),
    ]);

  const numeros = [
    { label: "Ao vivo", valor: aoVivo.length, href: paths.admin.partidas(tenantSlug) },
    { label: "Solicitações pendentes", valor: solicitacoesPendentes, href: paths.admin.solicitacoes(tenantSlug) },
    { label: "Times", valor: totalTimes, href: paths.admin.times(tenantSlug) },
    { label: "Atletas", valor: totalAtletas, href: paths.admin.times(tenantSlug) },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Card className="grid grid-cols-2 divide-border p-0 sm:grid-cols-4 sm:divide-x">
        {numeros.map((n) => (
          <Link key={n.label} href={n.href} className="px-4 py-3 hover:bg-field">
            <p className="font-display text-3xl font-bold leading-none tabular-nums">{n.valor}</p>
            <p className="mt-1 text-xs text-muted">{n.label}</p>
          </Link>
        ))}
      </Card>

      {aoVivo.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Ao vivo agora</h2>
          <div className="flex flex-col gap-2">
            {aoVivo.map((p) => (
              <PartidaListItem
                key={p.id}
                partida={p}
                actions={
                  <Link href={paths.admin.partidaSumula(tenantSlug, p.id)} className={acaoLinkClass}>
                    Abrir súmula
                  </Link>
                }
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-2 font-semibold">Próximas partidas</h2>
        {proximas.length === 0 ? (
          <EmptyState>
            Nenhuma partida agendada.{" "}
            <Link href={paths.admin.partidas(tenantSlug)} className="font-semibold text-accent">
              Agendar partida
            </Link>
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-2">
            {proximas.map((p) => (
              <PartidaListItem
                key={p.id}
                partida={p}
                actions={
                  <Link href={paths.admin.partidaSumula(tenantSlug, p.id)} className={acaoLinkClass}>
                    Súmula
                  </Link>
                }
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
