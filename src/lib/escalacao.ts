// Escalação em quadra (sem imports de servidor: roda também no navegador).
//
// Quadra = titulares (escolhidos pelo admin antes do jogo, ou a escalação
// provável pela posição) + substituições lançadas, aplicadas em ordem. Assim,
// apagar uma substituição na súmula devolve a quadra ao estado anterior.

export const VAGAS = ["GOL", "FIXO", "ALA_E", "ALA_D", "PIVO"] as const;
export type Vaga = (typeof VAGAS)[number];
export type Titulares = Partial<Record<Vaga, string>>;

type AtletaBase = { id: string; posicao: string };
type SubstituicaoBase = { tipo: string; atletaId: string | null; atletaEntraId: string | null; createdAt: string | Date };

/**
 * Quinteto em losango (goleiro, fixo, dois alas, pivô) pela posição cadastrada,
 * pelo menor número de camisa. Vagas sem jogador da posição são preenchidas por
 * quem joga na "Linha" (ou outro de linha).
 */
function escalacaoProvavel<A extends AtletaBase>(atletas: A[]) {
  const resto = [...atletas];
  const tirar = (ok: (a: A) => boolean) => {
    const i = resto.findIndex(ok);
    return i >= 0 ? resto.splice(i, 1)[0] : undefined;
  };
  const quadra: Partial<Record<Vaga, A>> = {
    GOL: tirar((a) => a.posicao === "GOLEIRO"),
    FIXO: tirar((a) => a.posicao === "FIXO"),
    ALA_E: tirar((a) => a.posicao === "ALA"),
    ALA_D: tirar((a) => a.posicao === "ALA"),
    PIVO: tirar((a) => a.posicao === "PIVO"),
  };
  for (const vaga of ["FIXO", "ALA_E", "ALA_D", "PIVO"] as const) {
    quadra[vaga] ??= tirar((a) => a.posicao === "LINHA") ?? tirar((a) => a.posicao !== "GOLEIRO");
  }
  quadra.GOL ??= tirar(() => true);
  return quadra;
}

export function lerTitulares(json: string | null | undefined): Titulares | null {
  if (!json) return null;
  try {
    const obj = JSON.parse(json) as Record<string, unknown>;
    const titulares: Titulares = {};
    for (const vaga of VAGAS) if (typeof obj[vaga] === "string") titulares[vaga] = obj[vaga] as string;
    return titulares;
  } catch {
    return null;
  }
}

/** Titulares (antes de qualquer substituição) — escolhidos ou prováveis. */
export function titularesDoTime<A extends AtletaBase>(atletas: A[], titularesJson: string | null | undefined) {
  const porId = new Map(atletas.map((a) => [a.id, a]));
  const escolhidos = lerTitulares(titularesJson);
  if (!escolhidos) return escalacaoProvavel(atletas);

  // Usa os escolhidos que ainda estão no elenco; vaga sem dono cai na regra provável.
  const quadra: Partial<Record<Vaga, A>> = {};
  const usados = new Set<string>();
  for (const vaga of VAGAS) {
    const a = escolhidos[vaga] ? porId.get(escolhidos[vaga]!) : undefined;
    if (a && !usados.has(a.id)) {
      quadra[vaga] = a;
      usados.add(a.id);
    }
  }
  const provavel = escalacaoProvavel(atletas.filter((a) => !usados.has(a.id)));
  for (const vaga of VAGAS) quadra[vaga] ??= provavel[vaga];
  return quadra;
}

export function escalacaoAtual<A extends AtletaBase>(
  atletas: A[],
  titularesJson: string | null | undefined,
  eventos: SubstituicaoBase[]
) {
  const porId = new Map(atletas.map((a) => [a.id, a]));
  const quadra = titularesDoTime(atletas, titularesJson);

  const substituicoes = eventos
    .filter((e) => e.tipo === "SUBSTITUICAO" && e.atletaId && e.atletaEntraId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  for (const s of substituicoes) {
    const vaga = VAGAS.find((v) => quadra[v]?.id === s.atletaId);
    const entra = porId.get(s.atletaEntraId!);
    if (vaga && entra && !VAGAS.some((v) => quadra[v]?.id === entra.id)) quadra[vaga] = entra;
  }

  const emQuadra = new Set(VAGAS.map((v) => quadra[v]?.id).filter(Boolean));
  return { quadra, banco: atletas.filter((a) => !emQuadra.has(a.id)) };
}

/** Minuto de jogo pelo horário de início (mesma conta do minuto ao vivo do feed). */
export function minutoDeJogo(dataHora: string | Date) {
  return Math.max(0, Math.floor((Date.now() - new Date(dataHora).getTime()) / 60000));
}
