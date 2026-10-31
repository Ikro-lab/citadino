import { notFound } from "next/navigation";
import { getPartidaDetalhe } from "@/lib/partidas";
import { getClassificacao } from "@/lib/classificacao";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { LiveMatchDetail } from "@/components/partidas/live-match-detail";
import { AvisoNotificacoes } from "@/components/push/aviso-notificacoes";
import { isAbaPartida } from "@/lib/labels";
import { auth } from "@/auth";

export default async function PartidaPage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string; id: string }>;
  searchParams: Promise<{ aba?: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const { aba } = await searchParams;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const partida = await getPartidaDetalhe(tenant.id, id);

  if (!partida) notFound();

  const categoria = await db.categoria.findUnique({
    where: { id: partida.categoria.id },
    include: { grupos: { include: { times: { select: { id: true } } } } },
  });

  let linhasClassificacao;
  if (categoria?.formato === "GRUPOS_MATA_MATA") {
    const grupo = categoria.grupos.find((g) =>
      g.times.some((t) => t.id === partida.timeCasa.id || t.id === partida.timeFora.id)
    );
    linhasClassificacao = await getClassificacao(tenant.id, partida.categoria.id, {
      timeIds: grupo?.times.map((t) => t.id),
      apenasFaseGrupos: true,
    });
  } else {
    linhasClassificacao = await getClassificacao(tenant.id, partida.categoria.id);
  }

  // Lances e escalação pela quadra são só do admin do campeonato (as ações
  // conferem de novo no servidor).
  const session = await auth();
  // O treinador escolhe os titulares do próprio time antes do jogo.
  const doTenant = session?.user?.tenantSlug === tenantSlug;
  const idsDosTimes = [partida.timeCasa.id, partida.timeFora.id];
  const timesEditaveis =
    doTenant && session.user.role === "ADMIN"
      ? idsDosTimes
      : doTenant && session.user.role === "TREINADOR" && partida.status === "AGENDADA"
        ? (
            await db.time.findMany({
              where: { id: { in: idsDosTimes }, treinadorId: session.user.id },
              select: { id: true },
            })
          ).map((t) => t.id)
        : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <AvisoNotificacoes tenantId={tenant.id} tenantSlug={tenantSlug} categoria={partida.categoria} />
      <LiveMatchDetail
        timesEditaveis={timesEditaveis}
        initial={partida}
        linhasClassificacao={linhasClassificacao}
        tenantSlug={tenantSlug}
        abaInicial={isAbaPartida(aba) ? aba : undefined}
      />
    </div>
  );
}
