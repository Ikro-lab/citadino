import "server-only";

/**
 * Descobre quando uma live do YouTube começou. Retorna null se ela ainda não
 * começou ou se não deu para descobrir — nesse caso a súmula oferece o botão
 * manual "A live começou agora".
 */
export async function buscarInicioLiveYoutube(videoId: string): Promise<Date | null> {
  if (process.env.YOUTUBE_API_KEY) {
    const pelaApi = await inicioPelaApi(videoId, process.env.YOUTUBE_API_KEY);
    if (pelaApi !== undefined) return pelaApi;
  }
  return inicioPelaPagina(videoId);
}

function dataValida(valor: string | undefined): Date | null {
  if (!valor) return null;
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) || data.getTime() > Date.now() ? null : data;
}

/**
 * YouTube Data API v3 (gratuita, 1 unidade de cota por consulta). Funciona de
 * qualquer servidor — a página pública costuma bloquear IPs de nuvem.
 * `undefined` = a API falhou (chave inválida, cota), tente a página.
 */
async function inicioPelaApi(videoId: string, chave: string): Promise<Date | null | undefined> {
  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/videos");
    url.searchParams.set("part", "liveStreamingDetails");
    url.searchParams.set("id", videoId);
    url.searchParams.set("key", chave);

    const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      console.error(`[youtube-live] API respondeu ${res.status} para ${videoId}`);
      return undefined;
    }
    const json = (await res.json()) as {
      items?: { liveStreamingDetails?: { actualStartTime?: string } }[];
    };
    // Sem `actualStartTime` a live ainda não começou (ou nem é live).
    return dataValida(json.items?.[0]?.liveStreamingDetails?.actualStartTime);
  } catch (e) {
    console.error("[youtube-live] falha na API", e);
    return undefined;
  }
}

/**
 * Plano B sem chave: lê a página pública do vídeo, que traz
 * `"liveBroadcastDetails":{"isLiveNow":true,"startTimestamp":"..."}`.
 */
async function inicioPelaPagina(videoId: string): Promise<Date | null> {
  try {
    const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "pt-BR" },
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    const detalhes = html.match(/"liveBroadcastDetails":\{([^}]*)\}/)?.[1];
    if (!detalhes) {
      console.warn(`[youtube-live] página sem dados da live para ${videoId} (bloqueio de IP?)`);
      return null;
    }

    // Antes de a live começar, o YouTube pode trazer o horário *agendado* aqui.
    // Só confiamos quando ela está no ar ou já terminou.
    const noAr = detalhes.includes('"isLiveNow":true');
    const terminou = detalhes.includes('"endTimestamp"');
    if (!noAr && !terminou) return null;

    return dataValida(detalhes.match(/"startTimestamp":"([^"]+)"/)?.[1]);
  } catch {
    return null;
  }
}
