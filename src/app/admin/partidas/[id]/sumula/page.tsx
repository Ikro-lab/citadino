import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { SumulaForm } from "@/components/partidas/sumula-form";
import {
  iniciarPartida,
  encerrarPartida,
  adiarPartida,
  deleteEvento,
} from "@/lib/actions/partidas";

const tipoLabel: Record<string, string> = {
  GOL: "Gol",
  CARTAO_AMARELO: "Cartão amarelo",
  CARTAO_VERMELHO: "Cartão vermelho",
  SUBSTITUICAO: "Substituição",
  OUTRO: "Outro",
};

export default async function SumulaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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
                  : partida.status === "ADIADA"
                    ? "danger"
                    : "neutral"
            }
            pulse={partida.status === "AO_VIVO"}
          >
            {partida.status.replace("_", " ")}
          </Badge>
        </div>

        <p className="mb-4 text-center text-2xl font-bold">
          {partida.timeCasa.nome} {partida.placarCasa} x {partida.placarFora} {partida.timeFora.nome}
        </p>

        <div className="flex flex-wrap gap-2">
          {partida.status === "AGENDADA" && (
            <>
              <form action={iniciarPartida.bind(null, id)}>
                <Button type="submit">Iniciar partida</Button>
              </form>
              <form action={adiarPartida.bind(null, id)}>
                <Button type="submit" variant="secondary">
                  Adiar
                </Button>
              </form>
            </>
          )}
          {partida.status === "AO_VIVO" && (
            <form action={encerrarPartida.bind(null, id)}>
              <Button type="submit" variant="secondary">
                Encerrar partida
              </Button>
            </form>
          )}
        </div>
      </Card>

      {(partida.status === "AO_VIVO" || partida.status === "AGENDADA") && (
        <Card>
          <h2 className="mb-3 font-semibold">Registrar evento</h2>
          <SumulaForm partidaId={id} timeCasa={partida.timeCasa} timeFora={partida.timeFora} />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 font-semibold">Eventos registrados</h2>
        <div className="flex flex-col gap-2">
          {partida.eventos.map((e) => (
            <div
              key={e.id}
              className="flex items-center justify-between rounded-xl border border-border px-3 py-2 text-sm"
            >
              <span>
                <span className="mr-2 font-mono font-semibold text-muted">{e.minuto}&apos;</span>
                {tipoLabel[e.tipo]} · {e.time.nome}
                {e.atleta && ` · ${e.atleta.nome} (#${e.atleta.numero})`}
              </span>
              <DeleteButton action={deleteEvento.bind(null, e.id, id)} />
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
