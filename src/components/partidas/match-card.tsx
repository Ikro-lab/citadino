import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import type { FeedPartida } from "@/lib/partidas";

const statusConfig = {
  AGENDADA: { label: "Agendada", variant: "neutral" as const },
  AO_VIVO: { label: "Ao vivo", variant: "live" as const },
  ENCERRADA: { label: "Encerrada", variant: "success" as const },
  ADIADA: { label: "Adiada", variant: "danger" as const },
};

function TeamRow({
  nome,
  placar,
  destaque,
}: {
  nome: string;
  placar: number | null;
  destaque: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-surface text-xs font-bold text-muted">
          {nome.slice(0, 2).toUpperCase()}
        </span>
        <span className={destaque ? "font-semibold" : "text-foreground"}>
          {nome}
        </span>
      </div>
      {placar !== null && (
        <span className={destaque ? "text-lg font-bold" : "text-lg font-bold text-muted"}>
          {placar}
        </span>
      )}
    </div>
  );
}

export function MatchCard({ partida }: { partida: FeedPartida }) {
  const status = statusConfig[partida.status];
  const showPlacar = partida.status !== "AGENDADA" && partida.status !== "ADIADA";
  const casaVence = partida.placarCasa > partida.placarFora;
  const foraVence = partida.placarFora > partida.placarCasa;

  const horario = new Date(partida.dataHora).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Link href={`/partida/${partida.id}`} className="block">
      <Card className="transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <Badge variant="accent">{partida.categoria.nome}</Badge>
          <Badge variant={status.variant} pulse={partida.status === "AO_VIVO"}>
            {status.label}
          </Badge>
        </div>

        <div className="flex flex-col gap-2">
          <TeamRow
            nome={partida.timeCasa.nome}
            placar={showPlacar ? partida.placarCasa : null}
            destaque={partida.status === "ENCERRADA" && casaVence}
          />
          <TeamRow
            nome={partida.timeFora.nome}
            placar={showPlacar ? partida.placarFora : null}
            destaque={partida.status === "ENCERRADA" && foraVence}
          />
        </div>

        {!showPlacar && (
          <p className="mt-3 text-sm font-medium text-muted">{horario}</p>
        )}
      </Card>
    </Link>
  );
}
