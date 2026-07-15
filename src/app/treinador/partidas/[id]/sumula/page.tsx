import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SumulaFormTreinador } from "@/components/partidas/sumula-form-treinador";

const tipoLabel: Record<string, string> = {
  GOL: "Gol",
  CARTAO_AMARELO: "Cartão amarelo",
  CARTAO_VERMELHO: "Cartão vermelho",
  SUBSTITUICAO: "Substituição",
  OUTRO: "Outro",
};

export default async function TreinadorSumulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const partida = await prisma.partida.findUnique({
    where: { id },
    include: {
      categoria: { select: { nome: true } },
      timeCasa: { include: { atletas: { orderBy: { numero: "asc" } } } },
      timeFora: { include: { atletas: { orderBy: { numero: "asc" } } } },
      eventos: {
        orderBy: { minuto: "asc" },
        include: { atleta: true, time: { select: { nome: true } } },
      },
    },
  });

  if (!partida) notFound();

  const meuTime =
    partida.timeCasa.treinadorId === userId
      ? partida.timeCasa
      : partida.timeFora.treinadorId === userId
        ? partida.timeFora
        : null;

  if (!meuTime) redirect("/treinador/partidas");

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="accent">{partida.categoria.nome}</Badge>
          <Badge
            variant={
              partida.status === "AO_VIVO"
                ? "live"
                : partida.status === "ENCERRADA"
                  ? "success"
                  : "neutral"
            }
            pulse={partida.status === "AO_VIVO"}
          >
            {partida.status.replace("_", " ")}
          </Badge>
        </div>
        <p className="text-center text-2xl font-bold">
          {partida.timeCasa.nome} {partida.placarCasa} x {partida.placarFora} {partida.timeFora.nome}
        </p>
      </Card>

      {partida.status === "AO_VIVO" ? (
        <Card>
          <h2 className="mb-3 font-semibold">Registrar evento do {meuTime.nome}</h2>
          <SumulaFormTreinador partidaId={id} timeId={meuTime.id} atletas={meuTime.atletas} />
        </Card>
      ) : (
        <p className="text-sm text-muted">
          Só é possível lançar eventos enquanto a partida estiver ao vivo.
        </p>
      )}

      <Card>
        <h2 className="mb-3 font-semibold">Eventos registrados</h2>
        <div className="flex flex-col gap-2">
          {partida.eventos.map((e) => (
            <div key={e.id} className="rounded-xl border border-border px-3 py-2 text-sm">
              <span className="mr-2 font-mono font-semibold text-muted">{e.minuto}&apos;</span>
              {tipoLabel[e.tipo]} · {e.time.nome}
              {e.atleta && ` · ${e.atleta.nome} (#${e.atleta.numero})`}
            </div>
          ))}
          {partida.eventos.length === 0 && (
            <p className="text-sm text-muted">Nenhum evento registrado.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
