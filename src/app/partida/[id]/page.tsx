import { notFound } from "next/navigation";
import { getPartidaDetalhe } from "@/lib/partidas";
import { LiveMatchDetail } from "@/components/partidas/live-match-detail";

export default async function PartidaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const partida = await getPartidaDetalhe(id);

  if (!partida) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <LiveMatchDetail initial={partida} />
    </div>
  );
}
