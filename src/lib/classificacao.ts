import { getTenantPrisma } from "@/lib/tenant-prisma";

export type LinhaClassificacao = {
  timeId: string;
  nome: string;
  escudoUrl: string | null;
  pontos: number;
  jogos: number;
  vitorias: number;
  empates: number;
  derrotas: number;
  golsPro: number;
  golsContra: number;
  saldoGols: number;
  /** Pontos de disciplina: amarelo 1, vermelho 3. Quem soma mais perde o desempate. */
  disciplina: number;
};

export type ResultadoConfronto = {
  timeCasaId: string;
  timeForaId: string;
  placarCasa: number;
  placarFora: number;
};

/** Pontos de disciplina por cartão (regulamento Taça Cidreira 2026, item III, alínea G). */
export const PONTOS_DISCIPLINA = { CARTAO_AMARELO: 1, CARTAO_VERMELHO: 3 } as const;

/**
 * Critérios de desempate que não dependem do confronto direto (regulamento,
 * item III, alíneas C a G): vitórias, menos gols sofridos, mais gols marcados,
 * saldo e disciplina. Servem também para comparar times de grupos diferentes
 * (melhores terceiros, ordem geral do mata-mata). O sorteio (alínea H) é feito
 * pela organização; aqui o empate total fica em ordem alfabética.
 */
export function compararCriteriosGerais(a: LinhaClassificacao, b: LinhaClassificacao) {
  return (
    b.vitorias - a.vitorias ||
    a.golsContra - b.golsContra ||
    b.golsPro - a.golsPro ||
    b.saldoGols - a.saldoGols ||
    a.disciplina - b.disciplina ||
    a.nome.localeCompare(b.nome)
  );
}

/** Pontos + critérios gerais, sem confronto direto (times de grupos diferentes). */
export function compararCampanha(a: LinhaClassificacao, b: LinhaClassificacao) {
  return b.pontos - a.pontos || compararCriteriosGerais(a, b);
}

/** Pontos de `timeId` nos jogos entre os dois times (confronto direto). */
function pontosNoConfronto(timeId: string, outroId: string, confrontos: ResultadoConfronto[]) {
  let pontos = 0;
  for (const c of confrontos) {
    const ehCasa = c.timeCasaId === timeId && c.timeForaId === outroId;
    const ehFora = c.timeForaId === timeId && c.timeCasaId === outroId;
    if (!ehCasa && !ehFora) continue;
    const pro = ehCasa ? c.placarCasa : c.placarFora;
    const contra = ehCasa ? c.placarFora : c.placarCasa;
    pontos += pro > contra ? 3 : pro === contra ? 1 : 0;
  }
  return pontos;
}

/**
 * Ordem da tabela pelo regulamento (item III): A) pontos; B) confronto direto,
 * só quando exatamente duas equipes empatam em pontos; C) vitórias; D) menos
 * gols sofridos; E) mais gols marcados; F) saldo; G) disciplina; H) sorteio.
 */
export function ordenarClassificacao(linhas: LinhaClassificacao[], confrontos: ResultadoConfronto[]) {
  const porPontos = new Map<number, LinhaClassificacao[]>();
  for (const l of linhas) porPontos.set(l.pontos, [...(porPontos.get(l.pontos) ?? []), l]);

  return [...porPontos.keys()]
    .sort((a, b) => b - a)
    .flatMap((pontos) => {
      const empatados = porPontos.get(pontos)!;
      if (empatados.length === 2) {
        const [a, b] = empatados;
        const diferenca = pontosNoConfronto(b.timeId, a.timeId, confrontos) - pontosNoConfronto(a.timeId, b.timeId, confrontos);
        if (diferenca !== 0) return diferenca > 0 ? [b, a] : [a, b];
      }
      return [...empatados].sort(compararCriteriosGerais);
    });
}

export async function getClassificacao(
  tenantId: string,
  categoriaId: string,
  opts?: { timeIds?: string[]; apenasFaseGrupos?: boolean; incluirAoVivo?: boolean }
) {
  const db = getTenantPrisma(tenantId);
  const times = await db.time.findMany({
    where: { categoriaId, ...(opts?.timeIds ? { id: { in: opts.timeIds } } : {}) },
    select: { id: true, nome: true, escudoUrl: true },
  });

  const tabela = new Map<string, LinhaClassificacao>();
  for (const time of times) {
    tabela.set(time.id, {
      timeId: time.id,
      nome: time.nome,
      escudoUrl: time.escudoUrl,
      pontos: 0,
      jogos: 0,
      vitorias: 0,
      empates: 0,
      derrotas: 0,
      golsPro: 0,
      golsContra: 0,
      saldoGols: 0,
      disciplina: 0,
    });
  }

  const partidas = await db.partida.findMany({
    where: {
      categoriaId,
      // Ao vivo conta com o placar do momento: "se terminasse agora".
      status: opts?.incluirAoVivo ? { in: ["ENCERRADA", "AO_VIVO"] } : "ENCERRADA",
      ...(opts?.apenasFaseGrupos ? { fase: "GRUPOS" } : {}),
    },
    select: {
      timeCasaId: true,
      timeForaId: true,
      placarCasa: true,
      placarFora: true,
      // Disciplina só conta dentro da fase (os mesmos jogos da tabela).
      eventos: {
        where: { tipo: { in: ["CARTAO_AMARELO", "CARTAO_VERMELHO"] } },
        select: { tipo: true, timeId: true },
      },
    },
  });

  const confrontos: ResultadoConfronto[] = [];
  for (const p of partidas) {
    const casa = tabela.get(p.timeCasaId);
    const fora = tabela.get(p.timeForaId);
    if (!casa || !fora) continue;
    confrontos.push(p);

    casa.jogos += 1;
    fora.jogos += 1;
    casa.golsPro += p.placarCasa;
    casa.golsContra += p.placarFora;
    fora.golsPro += p.placarFora;
    fora.golsContra += p.placarCasa;

    if (p.placarCasa > p.placarFora) {
      casa.vitorias += 1;
      casa.pontos += 3;
      fora.derrotas += 1;
    } else if (p.placarCasa < p.placarFora) {
      fora.vitorias += 1;
      fora.pontos += 3;
      casa.derrotas += 1;
    } else {
      casa.empates += 1;
      fora.empates += 1;
      casa.pontos += 1;
      fora.pontos += 1;
    }

    for (const e of p.eventos) {
      const linha = tabela.get(e.timeId);
      if (linha) linha.disciplina += PONTOS_DISCIPLINA[e.tipo as keyof typeof PONTOS_DISCIPLINA] ?? 0;
    }
  }

  const linhas = Array.from(tabela.values()).map((l) => ({
    ...l,
    saldoGols: l.golsPro - l.golsContra,
  }));

  return ordenarClassificacao(linhas, confrontos);
}
