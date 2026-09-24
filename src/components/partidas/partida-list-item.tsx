import { Badge } from "@/components/ui/badge";
import { formatDataHoraCurta } from "@/lib/date-utils";
import { statusPartida, type StatusPartida } from "@/lib/labels";

/**
 * Linha de partida dos painéis (admin/treinador). No celular os botões de
 * ação descem para baixo do placar em vez de estourar a largura da tela.
 */
export function PartidaListItem({
  partida,
  actions,
}: {
  partida: {
    status: StatusPartida;
    dataHora: Date;
    placarCasa: number;
    placarFora: number;
    timeCasa: { nome: string };
    timeFora: { nome: string };
    categoria?: { nome: string };
  };
  actions?: React.ReactNode;
}) {
  const status = statusPartida[partida.status];
  const temPlacar = partida.status === "AO_VIVO" || partida.status === "ENCERRADA";

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-surface p-4 dark:border dark:border-border sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium">
          {partida.timeCasa.nome}{" "}
          <span className="font-display text-lg font-bold tabular-nums">
            {temPlacar ? `${partida.placarCasa} x ${partida.placarFora}` : "x"}
          </span>{" "}
          {partida.timeFora.nome}
        </p>
        <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
          <Badge variant={status.variant} pulse={partida.status === "AO_VIVO"}>
            {status.label}
          </Badge>
          {partida.categoria && <span>{partida.categoria.nome}</span>}
          <span className="tabular-nums">{formatDataHoraCurta(partida.dataHora)}</span>
        </p>
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Ação secundária em formato de link/botão de texto, com área de toque de 44px. */
export const acaoLinkClass =
  "inline-flex h-10 items-center rounded-lg border border-border px-3 text-sm font-semibold text-foreground hover:bg-field";
