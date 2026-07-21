const YOUTUBE_REGEX = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/;
const TIMESTAMP_REGEX = /[?&]t=(\d+)s?/;

function parseYoutubeClip(url: string) {
  const idMatch = url.match(YOUTUBE_REGEX);
  if (!idMatch) return null;

  const tMatch = url.match(TIMESTAMP_REGEX);
  const momento = tMatch ? Number(tMatch[1]) : 0;

  return {
    videoId: idMatch[1],
    start: Math.max(0, momento - 10),
    end: momento + 5,
  };
}

export function EventoVideo({ url, className }: { url: string; className?: string }) {
  const youtube = parseYoutubeClip(url);

  if (youtube) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${youtube.videoId}?start=${youtube.start}&end=${youtube.end}`}
        title="Clipe do gol"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className={className}
      />
    );
  }

  return (
    // eslint-disable-next-line jsx-a11y/media-has-caption
    <video controls preload="metadata" src={url} className={className} />
  );
}
