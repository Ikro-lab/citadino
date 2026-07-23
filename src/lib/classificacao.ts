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
};

export async function getClassificacao(
  tenantId: string,
  categoriaId: string,
  opts?: { timeIds?: string[]; apenasFaseGrupos?: boolean }
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
    });
  }

  const partidas = await db.partida.findMany({
    where: {
      categoriaId,
      status: "ENCERRADA",
      ...(opts?.apenasFaseGrupos ? { fase: "GRUPOS" } : {}),
    },
    select: {
      timeCasaId: true,
      timeForaId: true,
      placarCasa: true,
      placarFora: true,
    },
  });

  for (const p of partidas) {
    const casa = tabela.get(p.timeCasaId);
    const fora = tabela.get(p.timeForaId);
    if (!casa || !fora) continue;

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
  }

  const linhas = Array.from(tabela.values()).map((l) => ({
    ...l,
    saldoGols: l.golsPro - l.golsContra,
  }));

  linhas.sort(
    (a, b) =>
      b.pontos - a.pontos ||
      b.saldoGols - a.saldoGols ||
      b.golsPro - a.golsPro ||
      a.nome.localeCompare(b.nome)
  );

  return linhas;
}
