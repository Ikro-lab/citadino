import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { EventoVideo } from "@/components/partidas/evento-video";
import { acaoLinkClass } from "@/components/partidas/partida-list-item";
import { ajustarGolSugerido, aprovarGolSugerido, descartarGolSugerido } from "@/lib/actions/gols-sugeridos";
import { extrairYoutubeId, youtubeUrlNoSegundo } from "@/lib/youtube";
import { formatHora } from "@/lib/date-utils";
import { nomeDoAtleta } from "@/lib/labels";
import { paths } from "@/lib/tenant-path";

const SITUACAO: Record<string, string> = {
  APROVADO: "Aprovado e lançado na súmula.",
  LANCADO: "Já tinha sido lançado na súmula; o clipe veio da transmissão.",
  DESCARTADO: "Descartado: nenhum gol foi lançado.",
};

const ajusteClass =
  "inline-flex h-10 min-w-14 items-center justify-center rounded-full bg-field px-3 text-sm font-semibold tabular-nums hover:bg-border";

export type GolSugeridoComPartida = {
  id: string;
  timeId: string;
  placarCasa: number;
  placarFora: number;
  videoSegundo: number;
  status: string;
  createdAt: Date;
  partida: {
    id: string;
    linkTransmissaoUrl: string | null;
    categoria: { nome: string };
    timeCasa: { id: string; nome: string };
    timeFora: { id: string; nome: string };
  };
};

function tempoVideo(segundo: number) {
  const h = Math.floor(segundo / 3600);
  const m = Math.floor((segundo % 3600) / 60);
  const s = String(segundo % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

/**
 * Gol visto no placar da live: o lance em vídeo (com ajuste do corte), o autor e
 * os botões de aprovar ou descartar. Usado na aba Gols detectados e na página
 * aberta pela notificação.
 */
export function GolSugeridoCard({
  sugestao,
  atletas,
  tenantSlug,
}: {
  sugestao: GolSugeridoComPartida;
  atletas: { id: string; nome: string; apelido: string | null; numero: number }[];
  tenantSlug: string;
}) {
  const { partida } = sugestao;
  const time = sugestao.timeId === partida.timeCasa.id ? partida.timeCasa : partida.timeFora;
  const videoId = extrairYoutubeId(partida.linkTransmissaoUrl);
  const pendente = sugestao.status === "PENDENTE";

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <Badge variant="accent">{partida.categoria.nome}</Badge>
        <Badge variant={pendente ? "live" : "neutral"}>
          {pendente ? "Esperando aprovação" : "Resolvido"} · {formatHora(sugestao.createdAt)}
        </Badge>
      </div>
      <h2 className="text-xl font-semibold">Gol de {time.nome}?</h2>
      <p className="mt-1 font-display text-2xl font-bold tabular-nums">
        {partida.timeCasa.nome} {sugestao.placarCasa} x {sugestao.placarFora} {partida.timeFora.nome}
      </p>

      {videoId && (
        <>
          {/* key: com o corte ajustado, o player recomeça no trecho novo. */}
          <EventoVideo
            key={sugestao.videoSegundo}
            url={youtubeUrlNoSegundo(videoId, sugestao.videoSegundo)}
            className="mt-4 aspect-video w-full rounded-xl bg-black"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="w-full text-xs text-muted tabular-nums">
              Corte em {tempoVideo(sugestao.videoSegundo)}. Gol fora do vídeo? Volte ou avance:
            </span>
            {[-10, -5, 5, 10].map((delta) => (
              <form key={delta} action={ajustarGolSugerido.bind(null, sugestao.id, delta)}>
                <button
                  type="submit"
                  className={ajusteClass}
                  aria-label={`${delta < 0 ? "Voltar" : "Avançar"} o clipe ${Math.abs(delta)} segundos`}
                >
                  {delta < 0 ? "−" : "+"}
                  {Math.abs(delta)}s
                </button>
              </form>
            ))}
          </div>
        </>
      )}

      {pendente ? (
        <div className="mt-4 border-t border-border pt-4">
          <form action={aprovarGolSugerido.bind(null, sugestao.id)} className="flex flex-col gap-3">
            <div>
              <Label htmlFor={`atleta-${sugestao.id}`}>Quem fez o gol ({time.nome})</Label>
              <Select id={`atleta-${sugestao.id}`} name="atletaId" defaultValue="">
                <option value="">Escolher depois</option>
                {atletas.map((a) => (
                  <option key={a.id} value={a.id}>
                    #{a.numero} {nomeDoAtleta(a)}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" size="lg" className="w-full">
              Aprovar gol
            </Button>
          </form>
          <form action={descartarGolSugerido.bind(null, sugestao.id)} className="mt-2">
            <Button type="submit" variant="secondary" size="lg" className="w-full">
              Descartar (não foi gol)
            </Button>
          </form>
        </div>
      ) : (
        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-border pt-4">
          <p className="text-sm">{SITUACAO[sugestao.status] ?? sugestao.status}</p>
          <Link href={paths.admin.partidaSumula(tenantSlug, partida.id)} className={acaoLinkClass}>
            Abrir a súmula
          </Link>
        </div>
      )}
    </Card>
  );
}
