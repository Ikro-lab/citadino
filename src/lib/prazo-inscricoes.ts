// Regra de inscrições abertas/encerradas do campeonato (sem imports de
// servidor: usada no link de convite, na área do treinador e no painel).

type PrazoInscricoes = { inscricoesAbertas: boolean; inscricoesEncerramEm: Date | string | null };

/** Encerradas quando o admin fechou na mão ou a data-limite já passou. */
export function inscricoesEncerradas(c: PrazoInscricoes, agora = Date.now()) {
  if (!c.inscricoesAbertas) return true;
  return c.inscricoesEncerramEm != null && new Date(c.inscricoesEncerramEm).getTime() <= agora;
}
