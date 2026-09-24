import { Badge } from "@/components/ui/badge";
import { EventoIcon } from "@/components/partidas/evento-icon";
import { statusPartida, tipoEventoLabel, type StatusPartida, type TipoEvento } from "@/lib/labels";

/** Cabeçalho de placar das súmulas (admin e treinador). */
export function SumulaPlacar({
  partida,
}: {
  partida: {
    status: StatusPartida;
    placarCasa: number;
    placarFora: number;
    timeCasa: { nome: string };
    timeFora: { nome: string };
    categoria: { nome: string };
  };
}) {
  const status = statusPartida[partida.status];
  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="accent">{partida.categoria.nome}</Badge>
        <Badge variant={status.variant} pulse={partida.status === "AO_VIVO"}>
          {status.label}
        </Badge>
      </div>
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-center">
        <p className="line-clamp-2 text-sm font-semibold">{partida.timeCasa.nome}</p>
        <p className="font-display text-4xl font-extrabold leading-none tabular-nums">
          {partida.placarCasa}
          <span className="mx-1 text-muted">–</span>
          {partida.placarFora}
        </p>
        <p className="line-clamp-2 text-sm font-semibold">{partida.timeFora.nome}</p>
      </div>
    </>
  );
}

/** Um lance já registrado na súmula; ações (vídeo, remover) descem no celular. */
export function EventoRegistrado({
  evento,
  children,
}: {
  evento: {
    tipo: string;
    minuto: number;
    time: { nome: string };
    atleta: { nome: string; numero: number } | null;
  };
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-border px-3 py-2.5 text-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-2.5">
        <span className="w-8 shrink-0 font-semibold text-muted tabular-nums">{evento.minuto}&apos;</span>
        <span className="mt-0.5 flex w-4 shrink-0 justify-center">
          <EventoIcon tipo={evento.tipo} />
        </span>
        <span className="min-w-0">
          <span className="block font-medium">
            {evento.atleta
              ? `${evento.atleta.nome} (#${evento.atleta.numero})`
              : tipoEventoLabel[evento.tipo as TipoEvento] ?? tipoEventoLabel.OUTRO}
          </span>
          <span className="block text-xs text-muted">
            {tipoEventoLabel[evento.tipo as TipoEvento] ?? tipoEventoLabel.OUTRO}, {evento.time.nome}
          </span>
        </span>
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{children}</div>}
    </div>
  );
}
