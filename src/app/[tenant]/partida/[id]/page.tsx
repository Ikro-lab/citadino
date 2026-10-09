import { notFound } from "next/navigation";
import { getPartidaDetalhe } from "@/lib/partidas";
import { getClassificacao } from "@/lib/classificacao";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { LiveMatchDetail } from "@/components/partidas/live-match-detail";
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

  // Quem pode mexer na escalação/lances pela quadra: admin do campeonato nos
  // dois times; treinador só no próprio. As ações conferem de novo no servidor.
  const session = await auth();
  let timesEditaveis: string[] = [];
  if (session?.user?.tenantSlug === tenantSlug) {
    const ids = [partida.timeCasa.id, partida.timeFora.id];
    if (session.user.role === "ADMIN") timesEditaveis = ids;
    else if (session.user.role === "TREINADOR") {
      const meus = await db.time.findMany({ where: { id: { in: ids }, treinadorId: session.user.id }, select: { id: true } });
      timesEditaveis = meus.map((t) => t.id);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
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
