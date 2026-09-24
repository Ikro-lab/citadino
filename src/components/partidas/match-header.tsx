import { Radio } from "lucide-react";
import { cn } from "@/lib/utils";
import { Escudo } from "@/components/times/escudo";
import { LiveMinuto } from "@/components/partidas/live-minuto";
import { TIMEZONE, formatHora } from "@/lib/date-utils";
import type { PartidaDetalhe } from "@/lib/partidas";

function LadoTime({ nome, escudoUrl, apagado }: { nome: string; escudoUrl: string | null; apagado: boolean }) {
  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <Escudo nome={nome} escudoUrl={escudoUrl} size={56} />
      <span className={cn("line-clamp-2 text-sm leading-tight font-medium", apagado && "text-muted")}>{nome}</span>
    </div>
  );
}

export function MatchHeader({ partida }: { partida: PartidaDetalhe }) {
  const aoVivo = partida.status === "AO_VIVO";
  const encerrada = partida.status === "ENCERRADA";
  const showPlacar = partida.status !== "AGENDADA" && partida.status !== "ADIADA";
  const casaPerde = encerrada && partida.placarCasa < partida.placarFora;
  const foraPerde = encerrada && partida.placarFora < partida.placarCasa;

  const data = new Date(partida.dataHora).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    timeZone: TIMEZONE,
  });

  return (
    <section className="rounded-2xl bg-surface px-4 pt-4 pb-5 dark:border dark:border-border">
      <p className="text-center text-xs text-muted first-letter:uppercase">
        {partida.categoria.nome}, {data}
        {partida.local ? `, ${partida.local}` : ""}
      </p>

      <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-2 text-center">
        <LadoTime nome={partida.timeCasa.nome} escudoUrl={partida.timeCasa.escudoUrl} apagado={casaPerde} />

        <div className="flex min-w-24 flex-col items-center gap-1.5">
          {showPlacar ? (
            <p
              className={cn(
                "flex h-14 items-center font-display text-5xl leading-none font-bold tabular-nums",
                aoVivo && "text-live"
              )}
            >
              <span className={cn(casaPerde && "text-muted")}>{partida.placarCasa}</span>
              <span className="mx-2 text-3xl text-muted">-</span>
              <span className={cn(foraPerde && "text-muted")}>{partida.placarFora}</span>
            </p>
          ) : (
            <p className="flex h-14 items-center font-display text-4xl leading-none font-bold tabular-nums">
              {formatHora(partida.dataHora)}
            </p>
          )}

          <div className="text-xs">
            {aoVivo ? (
              <LiveMinuto dataHora={partida.dataHora} />
            ) : encerrada ? (
              <span className="text-muted">Encerrado</span>
            ) : partida.status === "ADIADA" ? (
              <span className="text-live">Adiado</span>
            ) : (
              <span className="text-muted">Não começou</span>
            )}
          </div>
        </div>

        <LadoTime nome={partida.timeFora.nome} escudoUrl={partida.timeFora.escudoUrl} apagado={foraPerde} />
      </div>

      {partida.linkTransmissaoUrl && (
        <a
          href={partida.linkTransmissaoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "mt-5 flex h-11 items-center justify-center gap-2 rounded-full text-sm font-semibold",
            aoVivo ? "bg-live text-white hover:opacity-90" : "bg-field hover:bg-border"
          )}
        >
          <Radio size={16} />
          {aoVivo ? "Assistir ao vivo" : "Ver transmissão"}
        </a>
      )}
    </section>
  );
}
