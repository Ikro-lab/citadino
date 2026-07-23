import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Goal, Square } from "lucide-react";
import type { PartidaDetalhe } from "@/lib/partidas";
import { EventoVideo } from "./evento-video";
import { paths } from "@/lib/tenant-path";

const tipoConfig: Record<
  string,
  { label: string; icon: typeof Goal; className: string }
> = {
  GOL: { label: "Gol", icon: Goal, className: "text-accent" },
  CARTAO_AMARELO: { label: "Cartão amarelo", icon: Square, className: "text-yellow-500" },
  CARTAO_VERMELHO: { label: "Cartão vermelho", icon: Square, className: "text-danger" },
  SUBSTITUICAO: { label: "Substituição", icon: Square, className: "text-muted" },
  OUTRO: { label: "Evento", icon: Square, className: "text-muted" },
};

export function EventTimeline({ partida, tenantSlug }: { partida: PartidaDetalhe; tenantSlug: string }) {
  if (partida.eventos.length === 0) {
    return (
      <Card>
        <p className="text-center text-sm text-muted">
          Nenhum evento registrado ainda.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Linha do tempo</h2>
      <ol className="flex flex-col gap-3">
        {partida.eventos.map((evento) => {
          const config = tipoConfig[evento.tipo] ?? tipoConfig.OUTRO;
          const Icon = config.icon;
          const isCasa = evento.timeId === partida.timeCasa.id;

          return (
            <li key={evento.id} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 w-8 shrink-0 font-mono font-semibold text-muted">
                {evento.minuto}&apos;
              </span>
              <Icon size={16} className={`mt-0.5 shrink-0 ${config.className}`} />
              <div>
                <p className="font-medium">
                  {evento.atleta ? (
                    <Link href={paths.atleta(tenantSlug, evento.atleta.id)} className="hover:text-accent hover:underline">
                      {evento.atleta.nome}
                    </Link>
                  ) : (
                    config.label
                  )}
                  {evento.atleta && (
                    <span className="ml-1 text-muted">#{evento.atleta.numero}</span>
                  )}
                </p>
                <p className="text-xs text-muted">
                  {config.label} · {isCasa ? partida.timeCasa.nome : partida.timeFora.nome}
                  {evento.descricao ? ` · ${evento.descricao}` : ""}
                </p>
                {evento.videoUrl && (
                  <EventoVideo
                    url={evento.videoUrl}
                    className="mt-2 max-h-64 w-full max-w-sm rounded-lg"
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
