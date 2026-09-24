import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Radio } from "lucide-react";
import { Escudo } from "@/components/times/escudo";
import { TIMEZONE } from "@/lib/date-utils";
import { statusPartida } from "@/lib/labels";
import type { PartidaDetalhe } from "@/lib/partidas";

function LadoTime({
  nome,
  escudoUrl,
  vence,
}: {
  nome: string;
  escudoUrl: string | null;
  vence: boolean;
}) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <Escudo nome={nome} escudoUrl={escudoUrl} size={56} />
      <span className={`line-clamp-2 text-sm leading-tight ${vence ? "font-bold" : "font-medium"}`}>{nome}</span>
    </div>
  );
}

export function MatchHeader({ partida }: { partida: PartidaDetalhe }) {
  const status = statusPartida[partida.status];
  const aoVivo = partida.status === "AO_VIVO";
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
      <div className="mb-4 flex items-center justify-between gap-2">
        <Badge variant="accent">{partida.categoria.nome}</Badge>
        <Badge variant={status.variant} pulse={aoVivo}>
          {status.label}
        </Badge>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-start gap-3 text-center">
        <LadoTime nome={partida.timeCasa.nome} escudoUrl={partida.timeCasa.escudoUrl} vence={casaVence} />

        <div className="flex h-14 items-center">
          {showPlacar ? (
            <p className="font-display text-5xl font-extrabold leading-none tabular-nums">
              {partida.placarCasa}
              <span className="mx-1.5 text-muted">–</span>
              {partida.placarFora}
            </p>
          ) : (
            <p className="font-display text-2xl font-bold text-muted">vs</p>
          )}
        </div>

        <LadoTime nome={partida.timeFora.nome} escudoUrl={partida.timeFora.escudoUrl} vence={foraVence} />
      </div>

      <p className="mt-4 text-center text-sm text-muted first-letter:uppercase">
        {dataHora}
        {partida.local ? ` · ${partida.local}` : ""}
      </p>

      {partida.linkTransmissaoUrl && (
        <a
          href={partida.linkTransmissaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={
            aoVivo
              ? "mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent-dark"
              : "mt-4 flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-semibold hover:bg-background"
          }
        >
          <Radio size={16} />
          {aoVivo ? "Assistir ao vivo" : "Ver transmissão"}
        </a>
      )}
    </Card>
  );
}
