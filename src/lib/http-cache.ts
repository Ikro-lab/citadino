/**
 * Cabeçalhos das rotas públicas consultadas repetidamente durante jogo ao vivo
 * (feed, partida, enquete). A CDN da Vercel guarda a resposta por 5s: com 100
 * ou 10 mil torcedores olhando o mesmo jogo, o banco recebe ~1 consulta a cada
 * 5s em vez de uma por celular. O navegador não guarda nada (max-age=0), então
 * cada atualização passa pela CDN e vê no máximo 5s de atraso.
 */
export const CACHE_AO_VIVO = {
  "Cache-Control": "public, max-age=0, must-revalidate",
  "CDN-Cache-Control": "max-age=5, stale-while-revalidate=10",
} as const;
