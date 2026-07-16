import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Radio } from "lucide-react";
import { TIMEZONE } from "@/lib/date-utils";
import type { PartidaDetalhe } from "@/lib/partidas";

const statusConfig = {
  AGENDADA: { label: "Agendada", variant: "neutral" as const },
  AO_VIVO: { label: "Ao vivo", variant: "live" as const },
  ENCERRADA: { label: "Encerrada", variant: "success" as const },
  ADIADA: { label: "Adiada", variant: "danger" as const },
};

export function MatchHeader({ partida }: { partida: PartidaDetalhe }) {
  const status = statusConfig[partida.status];
  const showPlacar = partida.status !== "AGENDADA" && partida.status !== "ADIADA";
  const casaVence = partida.status === "ENCERRADA" && partida.placarCasa > partida.placarFora;
  const foraVence = partida.status === "ENCERRADA" && partida.placarFora > partida.placarCasa;

  const dataHora = new Date(partida.dataHora).toLocaleString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TIMEZONE,
  });

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <Badge variant="accent">{partida.categoria.nome}</Badge>
        <Badge variant={status.variant} pulse={partida.status === "AO_VIVO"}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-3 items-center gap-2 text-center">
        <div className="flex flex-col items-center gap-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-sm font-bold text-muted">
            {partida.timeCasa.nome.slice(0, 3).toUpperCase()}
          </span>
          <span className={casaVence ? "font-bold" : "font-medium"}>
            {partida.timeCasa.nome}
          </span>
        </div>

        <div>
          {showPlacar ? (
            <p className="text-3xl font-extrabold tracking-tight">
              {partida.placarCasa} <span className="text-muted">–</span> {partida.placarFora}
            </p>
          ) : (
            <p className="text-lg font-bold text-muted">vs</p>
          )}
        </div>

        <div className="flex flex-col items-center gap-2">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-surface text-sm font-bold text-muted">
            {partida.timeFora.nome.slice(0, 3).toUpperCase()}
          </span>
          <span className={foraVence ? "font-bold" : "font-medium"}>
            {partida.timeFora.nome}
          </span>
        </div>
      </div>

      <p className="mt-4 text-center text-sm text-muted capitalize">
        {dataHora}
        {partida.local ? ` · ${partida.local}` : ""}
      </p>

      {partida.linkTransmissaoUrl && (
        <a
          href={partida.linkTransmissaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-accent hover:underline"
        >
          <Radio size={16} />
          Assistir ao vivo
        </a>
      )}
    </Card>
  );
}
