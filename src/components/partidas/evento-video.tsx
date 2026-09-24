import { extrairYoutubeId, segundoDoLink } from "@/lib/youtube";

// Janela do clipe em volta do segundo marcado no link: a jogada antes do gol
// e a comemoração depois.
const SEGUNDOS_ANTES = 10;
const SEGUNDOS_DEPOIS = 8;

function parseYoutubeClip(url: string) {
  const videoId = extrairYoutubeId(url);
  if (!videoId) return null;

  const momento = segundoDoLink(url) ?? 0;

  return {
    videoId,
    start: Math.max(0, momento - SEGUNDOS_ANTES),
    end: momento + SEGUNDOS_DEPOIS,
  };
}

export function EventoVideo({ url, className }: { url: string; className?: string }) {
  const youtube = parseYoutubeClip(url);

  if (youtube) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtube.videoId}?start=${youtube.start}&end=${youtube.end}&playsinline=1&rel=0`}
        title="Clipe do gol"
        // Só baixa o player quando o lance aparece na tela — economiza dados no 4G.
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className}
      />
    );
  }

  return <video controls preload="metadata" playsInline src={url} className={className} />;
}
