import { PlayCircle } from "lucide-react";
import { ajustarClipeEvento } from "@/lib/actions/partidas";
import { segundoDoLink } from "@/lib/youtube";

const ajusteClass =
  "inline-flex h-10 items-center rounded-full bg-field px-3.5 text-sm font-semibold tabular-nums hover:bg-border";

/**
 * Clipe automático de um gol na súmula: abre o vídeo no ponto marcado e
 * permite adiantar/atrasar 10s caso o gol tenha sido registrado com atraso.
 */
export function ClipeYoutubeAjuste({ eventoId, videoUrl }: { eventoId: string; videoUrl: string }) {
  const segundo = segundoDoLink(videoUrl) ?? 0;
  const h = Math.floor(segundo / 3600);
  const m = Math.floor((segundo % 3600) / 60);
  const s = String(segundo % 60).padStart(2, "0");
  const minutoVideo = h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;

  return (
    <>
      <a
        href={videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-accent hover:bg-accent-soft"
      >
        <PlayCircle size={16} />
        <span className="tabular-nums">{minutoVideo}</span>
      </a>
      <form action={ajustarClipeEvento.bind(null, eventoId, -10)}>
        <button type="submit" className={ajusteClass} aria-label="Voltar o clipe 10 segundos">
          −10s
        </button>
      </form>
      <form action={ajustarClipeEvento.bind(null, eventoId, 10)}>
        <button type="submit" className={ajusteClass} aria-label="Avançar o clipe 10 segundos">
          +10s
        </button>
      </form>
    </>
  );
}
