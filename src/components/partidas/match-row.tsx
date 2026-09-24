import Link from "next/link";
import { cn } from "@/lib/utils";
import { FormaRecente } from "@/components/partidas/forma-recente";
import { LiveMinuto } from "@/components/partidas/live-minuto";
import { FavoritoStar } from "@/components/partidas/favorito-star";
import { Escudo } from "@/components/times/escudo";
import { formatHora } from "@/lib/date-utils";
import type { FeedPartida } from "@/lib/partidas";
import { paths } from "@/lib/tenant-path";

type Tom = "vivo" | "vence" | "perde" | "neutro";

function LinhaTime({
  nome,
  escudoUrl,
  forma,
  tom,
}: {
  nome: string;
  escudoUrl: string | null;
  forma: ("V" | "E" | "D")[];
  tom: Tom;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <Escudo nome={nome} escudoUrl={escudoUrl} size={18} />
      <span className={cn("truncate text-sm", tom === "perde" ? "text-muted" : "text-foreground", tom === "vence" && "font-semibold")}>
        {nome}
      </span>
      <FormaRecente resultados={forma} />
    </div>
  );
}

function Placar({ valor, tom }: { valor: number; tom: Tom }) {
  return (
    <span
      className={cn(
        "font-display text-lg leading-none font-bold tabular-nums",
        tom === "vivo" && "text-live",
        tom === "perde" && "text-muted"
      )}
    >
      {valor}
    </span>
  );
}

export function MatchRow({
  partida,
  forma,
  tenantSlug,
}: {
  partida: FeedPartida;
  forma: Record<string, ("V" | "E" | "D")[]>;
  tenantSlug: string;
}) {
  const aoVivo = partida.status === "AO_VIVO";
  const encerrada = partida.status === "ENCERRADA";
  const showScore = partida.status !== "AGENDADA" && partida.status !== "ADIADA";

  const tom = (meu: number, outro: number): Tom =>
    aoVivo ? "vivo" : !encerrada || meu === outro ? "neutro" : meu > outro ? "vence" : "perde";
  const tomCasa = tom(partida.placarCasa, partida.placarFora);
  const tomFora = tom(partida.placarFora, partida.placarCasa);

  return (
    <div className="flex items-center border-b border-border last:border-0">
      <Link
        href={paths.partida(tenantSlug, partida.id)}
        className="flex min-w-0 flex-1 items-center gap-3 py-3 pl-4 hover:bg-field"
      >
        {/* Horário/status separado dos times por um fio, como num placar eletrônico. */}
        <div className="flex w-11 shrink-0 flex-col items-center border-r border-border pr-3 text-xs tabular-nums">
          {aoVivo ? (
            <LiveMinuto dataHora={partida.dataHora} />
          ) : encerrada ? (
            <span className="text-muted">Fim</span>
          ) : partida.status === "ADIADA" ? (
            <span className="text-live">Adiada</span>
          ) : (
            <span className="font-medium">{formatHora(partida.dataHora)}</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <LinhaTime
            nome={partida.timeCasa.nome}
            escudoUrl={partida.timeCasa.escudoUrl}
            forma={forma[partida.timeCasa.id] ?? []}
            tom={tomCasa}
          />
          <LinhaTime
            nome={partida.timeFora.nome}
            escudoUrl={partida.timeFora.escudoUrl}
            forma={forma[partida.timeFora.id] ?? []}
            tom={tomFora}
          />
        </div>

        {showScore && (
          <div className="flex w-6 shrink-0 flex-col items-end gap-2">
            <Placar valor={partida.placarCasa} tom={tomCasa} />
            <Placar valor={partida.placarFora} tom={tomFora} />
          </div>
        )}
      </Link>

      <FavoritoStar partidaId={partida.id} />
    </div>
  );
}
