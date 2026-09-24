import Link from "next/link";
import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { EmptyState } from "@/components/ui/empty-state";
import { PartidaListItem, acaoLinkClass } from "@/components/partidas/partida-list-item";

export default async function TreinadorPartidasPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const session = await auth();
  const userId = session!.user.id;
  const db = getTenantPrisma(session!.user.tenantId!);

  const times = await db.time.findMany({
    where: { treinadorId: userId },
    select: { id: true },
  });
  const timeIds = times.map((t) => t.id);

  const partidas = timeIds.length
    ? await db.partida.findMany({
        where: { OR: [{ timeCasaId: { in: timeIds } }, { timeForaId: { in: timeIds } }] },
        orderBy: { dataHora: "desc" },
        include: {
          timeCasa: { select: { nome: true } },
          timeFora: { select: { nome: true } },
          categoria: { select: { nome: true } },
        },
      })
    : [];

  return (
    <div className="flex flex-col gap-2">
      {partidas.map((p) => (
        <PartidaListItem
          key={p.id}
          partida={p}
          actions={
            <Link href={paths.treinador.partidaSumula(tenantSlug, p.id)} className={acaoLinkClass}>
              {p.status === "AO_VIVO" ? "Lançar lances" : "Ver súmula"}
            </Link>
          }
        />
      ))}
      {partidas.length === 0 && (
        <EmptyState>Seu time ainda não tem partidas agendadas. O organizador monta a tabela.</EmptyState>
      )}
    </div>
  );
}
