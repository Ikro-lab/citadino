import Link from "next/link";
import { Card } from "@/components/ui/card";
import type { PartidaDetalhe } from "@/lib/partidas";
import { tipoEventoLabel, type TipoEvento } from "@/lib/labels";
import { EventoIcon } from "./evento-icon";
import { EventoVideo } from "./evento-video";
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

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Linha do tempo</h2>
      <ol className="flex flex-col gap-3">
        {partida.eventos.map((evento) => {
          const label = tipoEventoLabel[evento.tipo as TipoEvento] ?? tipoEventoLabel.OUTRO;
          const isCasa = evento.timeId === partida.timeCasa.id;

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
                  {evento.atleta ? (
                    <Link href={paths.atleta(tenantSlug, evento.atleta.id)} className="hover:text-accent hover:underline">
                      {evento.atleta.nome}
                    </Link>
                  ) : (
                    label
                  )}
                  {evento.atleta && (
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
              </div>
            </li>
          );
        })}
      </ol>
    </Card>
  );
}
