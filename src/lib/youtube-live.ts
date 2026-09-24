import "server-only";

/**
 * Descobre quando uma live do YouTube começou, lendo a página pública do
 * vídeo (sem chave de API). A página traz, nos dados estruturados,
 * `"liveBroadcastDetails":{"isLiveNow":true,"startTimestamp":"..."}`.
 *
 * Retorna null se não conseguir (live ainda não começou, página mudou,
 * YouTube fora do ar) — nesse caso a súmula oferece o botão manual
 * "A live começou agora".
 */
export async function buscarInicioLiveYoutube(videoId: string): Promise<Date | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "pt-BR" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const detalhes = html.match(/"liveBroadcastDetails":\{([^}]*)\}/)?.[1];
    if (!detalhes) return null;

    // Antes de a live começar, o YouTube pode trazer o horário *agendado* aqui.
    // Só confiamos quando ela está no ar ou já terminou.
    const noAr = detalhes.includes('"isLiveNow":true');
    const terminou = detalhes.includes('"endTimestamp"');
    if (!noAr && !terminou) return null;

    const inicio = detalhes.match(/"startTimestamp":"([^"]+)"/)?.[1];
    if (!inicio) return null;

    const data = new Date(inicio);
    if (Number.isNaN(data.getTime()) || data.getTime() > Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
