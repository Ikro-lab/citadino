import Link from "next/link";
import { FormaRecente } from "@/components/partidas/forma-recente";
import { LiveMinuto } from "@/components/partidas/live-minuto";
import { FavoritoStar } from "@/components/partidas/favorito-star";
import { Escudo } from "@/components/times/escudo";
import { formatHora } from "@/lib/date-utils";
import type { FeedPartida } from "@/lib/partidas";
import { paths } from "@/lib/tenant-path";

function LinhaTime({
  nome,
  escudoUrl,
  placar,
  destaque,
  forma,
}: {
  nome: string;
  escudoUrl: string | null;
  placar: number | null;
  destaque: boolean;
  forma: ("V" | "E" | "D")[];
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <Escudo nome={nome} escudoUrl={escudoUrl} size={22} />
        <span className={`truncate text-sm ${destaque ? "font-bold" : "font-medium"}`}>{nome}</span>
        <FormaRecente resultados={forma} />
      </div>
      {placar !== null && (
        <span
          className={`shrink-0 font-display text-lg leading-none tabular-nums ${destaque ? "font-extrabold" : "font-semibold text-muted"}`}
        >
          {placar}
        </span>
      )}
    </div>
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
  const showScore = partida.status !== "AGENDADA" && partida.status !== "ADIADA";
  const casaVence = partida.status === "ENCERRADA" && partida.placarCasa > partida.placarFora;
  const foraVence = partida.status === "ENCERRADA" && partida.placarFora > partida.placarCasa;
  const aoVivo = partida.status === "AO_VIVO";

  return (
    <div className="flex items-center gap-1 border-b border-border pl-3 last:border-0 hover:bg-surface/60">
      <Link href={paths.partida(tenantSlug, partida.id)} className="flex min-w-0 flex-1 items-center gap-3 py-2.5">
        <div className="w-11 shrink-0 text-center text-xs font-semibold tabular-nums">
          {aoVivo ? (
            <LiveMinuto dataHora={partida.dataHora} />
          ) : partida.status === "ENCERRADA" ? (
            <span className="text-muted">Fim</span>
          ) : partida.status === "ADIADA" ? (
            <span className="text-danger">Adiada</span>
          ) : (
            <span className="text-muted">{formatHora(partida.dataHora)}</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <LinhaTime
            nome={partida.timeCasa.nome}
            escudoUrl={partida.timeCasa.escudoUrl}
            placar={showScore ? partida.placarCasa : null}
            destaque={casaVence || aoVivo}
            forma={forma[partida.timeCasa.id] ?? []}
          />
          <LinhaTime
            nome={partida.timeFora.nome}
            escudoUrl={partida.timeFora.escudoUrl}
            placar={showScore ? partida.placarFora : null}
            destaque={foraVence || aoVivo}
            forma={forma[partida.timeFora.id] ?? []}
          />
        </div>
      </Link>

      <FavoritoStar partidaId={partida.id} />
    </div>
  );
}
