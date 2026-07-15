import Link from "next/link";
import { FormaRecente } from "@/components/partidas/forma-recente";
import { LiveMinuto } from "@/components/partidas/live-minuto";
import { FavoritoStar } from "@/components/partidas/favorito-star";
import type { FeedPartida } from "@/lib/partidas";

function Escudo({ nome }: { nome: string }) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-muted">
      {nome.slice(0, 2).toUpperCase()}
    </span>
  );
}

function LinhaTime({
  nome,
  placar,
  destaque,
  forma,
}: {
  nome: string;
  placar: number | null;
  destaque: boolean;
  forma: ("V" | "E" | "D")[];
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex min-w-0 items-center gap-2">
        <Escudo nome={nome} />
        <span className={`truncate text-sm ${destaque ? "font-bold" : "font-medium"}`}>{nome}</span>
        <FormaRecente resultados={forma} />
      </div>
      {placar !== null && (
        <span className={`shrink-0 text-sm ${destaque ? "font-bold" : "text-muted"}`}>{placar}</span>
      )}
    </div>
  );
}

export function MatchRow({
  partida,
  forma,
}: {
  partida: FeedPartida;
  forma: Record<string, ("V" | "E" | "D")[]>;
}) {
  const showScore = partida.status !== "AGENDADA" && partida.status !== "ADIADA";
  const casaVence = partida.status === "ENCERRADA" && partida.placarCasa > partida.placarFora;
  const foraVence = partida.status === "ENCERRADA" && partida.placarFora > partida.placarCasa;

  const horario = new Date(partida.dataHora).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="flex items-center gap-2 border-b border-border px-3 py-2 last:border-0 hover:bg-surface/60">
      <Link href={`/partida/${partida.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="w-10 shrink-0 text-center">
          {partida.status === "AO_VIVO" ? (
            <LiveMinuto dataHora={partida.dataHora} />
          ) : partida.status === "ENCERRADA" ? (
            <span className="text-[11px] font-semibold text-muted">Fim</span>
          ) : partida.status === "ADIADA" ? (
            <span className="text-[11px] font-semibold text-danger">Adiada</span>
          ) : (
            <span className="text-[11px] font-semibold text-muted">{horario}</span>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <LinhaTime
            nome={partida.timeCasa.nome}
            placar={showScore ? partida.placarCasa : null}
            destaque={casaVence}
            forma={forma[partida.timeCasa.id] ?? []}
          />
          <LinhaTime
            nome={partida.timeFora.nome}
            placar={showScore ? partida.placarFora : null}
            destaque={foraVence}
            forma={forma[partida.timeFora.id] ?? []}
          />
        </div>
      </Link>

      <FavoritoStar partidaId={partida.id} />
    </div>
  );
}
