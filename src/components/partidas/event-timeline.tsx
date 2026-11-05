import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { PartidaDetalhe } from "@/lib/partidas";
import { nomeDoAtleta, tipoEventoLabel, type TipoEvento } from "@/lib/labels";
import { EventoIcon } from "./evento-icon";
import { EventoVideo } from "./evento-video";
import { CompartilharGol } from "./compartilhar-gol";
import { paths } from "@/lib/tenant-path";

export function EventTimeline({ partida, tenantSlug }: { partida: PartidaDetalhe; tenantSlug: string }) {
  if (partida.eventos.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-muted">
          Nenhum lance registrado ainda.
        </p>
      </Card>
    );
  }

  // Placar depois de cada gol, para o texto do link compartilhado.
  const placarNoGol = new Map<string, string>();
  let golsCasa = 0;
  let golsFora = 0;
  for (const e of partida.eventos) {
    if (e.tipo !== "GOL") continue;
    if (e.timeId === partida.timeCasa.id) golsCasa++;
    else golsFora++;
    placarNoGol.set(e.id, `${partida.timeCasa.nome} ${golsCasa} x ${golsFora} ${partida.timeFora.nome}`);
  }

  return (
    <Card>
      <ol className="flex flex-col gap-3">
        {partida.eventos.map((evento) => {
          const label = tipoEventoLabel[evento.tipo as TipoEvento] ?? tipoEventoLabel.OUTRO;
          const isCasa = evento.timeId === partida.timeCasa.id;
          const timeNome = isCasa ? partida.timeCasa.nome : partida.timeFora.nome;

          return (
            <li key={evento.id} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 w-8 shrink-0 font-semibold text-muted tabular-nums">
                {evento.minuto}&apos;
              </span>
              <span className="mt-0.5 flex w-4 shrink-0 justify-center">
                <EventoIcon tipo={evento.tipo} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {evento.tipo === "SUBSTITUICAO" && evento.atleta && evento.atletaEntra ? (
                    <>
                      <span className="font-normal text-muted">Sai </span>
                      <Link href={paths.atleta(tenantSlug, evento.atleta.id)} className="hover:text-accent hover:underline">
                        {nomeDoAtleta(evento.atleta)}
                      </Link>
                      <span className="font-normal text-muted">, entra </span>
                      <Link href={paths.atleta(tenantSlug, evento.atletaEntra.id)} className="hover:text-accent hover:underline">
                        {nomeDoAtleta(evento.atletaEntra)}
                      </Link>
                    </>
                  ) : evento.atleta ? (
                    <Link href={paths.atleta(tenantSlug, evento.atleta.id)} className="hover:text-accent hover:underline">
                      {nomeDoAtleta(evento.atleta)}
                    </Link>
                  ) : (
                    label
                  )}
                  {evento.atleta && !(evento.tipo === "SUBSTITUICAO" && evento.atletaEntra) && (
                    <span className="ml-1 text-muted tabular-nums">#{evento.atleta.numero}</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {label}, {isCasa ? partida.timeCasa.nome : partida.timeFora.nome}
                  {evento.descricao ? `. ${evento.descricao}` : ""}
                </p>
                {evento.videoUrl && (
                  <EventoVideo
                    url={evento.videoUrl}
                    className="mt-2 aspect-video max-h-64 w-full rounded-lg bg-black"
                  />
                )}
                {evento.tipo === "GOL" && (
                  <CompartilharGol
                    caminho={paths.gol(tenantSlug, evento.id)}
                    texto={`Gol de ${evento.atleta ? `${nomeDoAtleta(evento.atleta)} (${timeNome})` : timeNome}! ${placarNoGol.get(evento.id)}`}
                    className="-ml-3 mt-1"
                  />
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
