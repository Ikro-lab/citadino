// Utilitários de link do YouTube — sem imports de servidor, usados também no cliente.

const ID_REGEX =
  /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|live\/|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/;

/** Extrai o ID de 11 caracteres de qualquer formato comum de link do YouTube. */
export function extrairYoutubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  return url.match(ID_REGEX)?.[1] ?? null;
}

/** Link do vídeo começando num segundo específico (ex: o lance de um gol na live gravada). */
export function youtubeUrlNoSegundo(videoId: string, segundo: number): string {
  return `https://www.youtube.com/watch?v=${videoId}&t=${Math.max(0, Math.round(segundo))}s`;
}

/** Lê o segundo marcado num link `...&t=754s` (ou `?t=754`). */
export function segundoDoLink(url: string): number | null {
  const m = url.match(/[?&]t=(\d+)s?/);
  return m ? Number(m[1]) : null;
}
