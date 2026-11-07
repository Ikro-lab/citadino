import { extrairYoutubeId, segundoDoLink } from "@/lib/youtube";
import { YoutubeClipe } from "./youtube-clipe";

// Janela do clipe em volta do segundo marcado no link: a jogada antes do gol
// e a comemoração depois.
const SEGUNDOS_ANTES = 10;
const SEGUNDOS_DEPOIS = 8;

/** `ativo`: modo do feed de gols (toca sozinho enquanto está na tela). */
export function EventoVideo({ url, className, ativo }: { url: string; className?: string; ativo?: boolean }) {
  const videoId = extrairYoutubeId(url);

  if (videoId) {
    const momento = segundoDoLink(url) ?? 0;
    return (
      <YoutubeClipe
        videoId={videoId}
        inicio={Math.max(0, momento - SEGUNDOS_ANTES)}
        fim={momento + SEGUNDOS_DEPOIS}
        className={className}
        ativo={ativo}
      />
    );
  }

  return <video controls preload="metadata" playsInline src={url} className={className} />;
}
