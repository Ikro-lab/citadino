import { notFound } from "next/navigation";
import { getPartidaDetalhe } from "@/lib/partidas";
import { getClassificacao } from "@/lib/classificacao";
import { prisma } from "@/lib/prisma";
import { LiveMatchDetail } from "@/components/partidas/live-match-detail";

export default async function PartidaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partida = await getPartidaDetalhe(id);

  if (!partida) notFound();

  const categoria = await prisma.categoria.findUnique({
    where: { id: partida.categoria.id },
    include: { grupos: { include: { times: { select: { id: true } } } } },
  });

  let linhasClassificacao;
  if (categoria?.formato === "GRUPOS_MATA_MATA") {
    const grupo = categoria.grupos.find((g) =>
      g.times.some((t) => t.id === partida.timeCasa.id || t.id === partida.timeFora.id)
    );
    linhasClassificacao = await getClassificacao(partida.categoria.id, {
      timeIds: grupo?.times.map((t) => t.id),
      apenasFaseGrupos: true,
    });
  } else {
    linhasClassificacao = await getClassificacao(partida.categoria.id);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <LiveMatchDetail initial={partida} linhasClassificacao={linhasClassificacao} />
    </div>
  );
}
