/** Cada curtida dos outros aparece no feed de gols valendo este tanto. */
export const MULTIPLICADOR_CURTIDAS = 7;

/**
 * Total que o aparelho vê: as curtidas dos outros multiplicadas e a dele
 * valendo 1, para quem curte ver o número subir só um.
 */
export function curtidasExibidas(total: number, curtido: boolean) {
  const minha = curtido ? 1 : 0;
  return Math.max(0, total - minha) * MULTIPLICADOR_CURTIDAS + minha;
}
