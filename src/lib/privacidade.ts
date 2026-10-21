/**
 * Política de privacidade e aceite (LGPD).
 *
 * Ao mudar o texto da política de forma relevante, atualize PRIVACIDADE_VERSAO:
 * cada aceite guarda a versão que a pessoa viu.
 */
export const PRIVACIDADE_VERSAO = "2026-10-21";

/** Data por extenso mostrada no fim da política. */
export const PRIVACIDADE_ATUALIZADA_EM = "21 de outubro de 2026";

export type AceiteOrigem = "ATLETA" | "RESPONSAVEL" | "DECLARADO";

/**
 * Empresa que fornece a plataforma (a operadora). Vem do ambiente para não
 * fixar CNPJ no código: PRIVACIDADE_OPERADORA_NOME, PRIVACIDADE_OPERADORA_CNPJ
 * e PRIVACIDADE_OPERADORA_EMAIL (canal de contato; como agente de pequeno porte,
 * a operadora não precisa nomear encarregado, Resolução CD/ANPD nº 2/2022).
 */
export function operadora() {
  return {
    nome: process.env.PRIVACIDADE_OPERADORA_NOME?.trim() || "a empresa que fornece o Citadino",
    cnpj: process.env.PRIVACIDADE_OPERADORA_CNPJ?.trim() || null,
    email: process.env.PRIVACIDADE_OPERADORA_EMAIL?.trim() || null,
  };
}

/** Idade completa em anos numa data de referência (padrão: hoje). */
export function idadeEm(nascimento: Date, referencia = new Date()) {
  let idade = referencia.getUTCFullYear() - nascimento.getUTCFullYear();
  const m = referencia.getUTCMonth() - nascimento.getUTCMonth();
  if (m < 0 || (m === 0 && referencia.getUTCDate() < nascimento.getUTCDate())) idade--;
  return idade;
}

export function ehMenorDeIdade(nascimento: Date, referencia = new Date()) {
  return idadeEm(nascimento, referencia) < 18;
}
