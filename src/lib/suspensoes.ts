import { getTenantPrisma } from "@/lib/tenant-prisma";

/**
 * Suspensões por cartão (regulamento Taça Cidreira 2026, item V e art. 6º):
 * - 3 amarelos acumulados: suspenso no jogo seguinte do time; a contagem
 *   recomeça depois de fechar a sequência.
 * - Vermelho: suspenso no jogo seguinte (o julgamento da Comissão Disciplinar
 *   pode aumentar a pena; isso fica com a organização).
 * - Amarelo e vermelho no mesmo jogo: cada sequência fecha de forma isolada,
 *   então as suspensões se somam.
 *
 * A suspensão é cumprida no próximo jogo encerrado do time, tenha o atleta
 * entrado ou não na súmula.
 */

export type StatusSuspensao = "ok" | "pendurado" | "suspenso";

export type CartaoNoJogo = { atletaId: string; tipo: "CARTAO_AMARELO" | "CARTAO_VERMELHO" };
export type JogoComCartoes = { timeIds: [string, string]; cartoes: CartaoNoJogo[] };

export type SituacaoAtleta = {
  /** Amarelos da sequência em aberto (ainda não viraram suspensão). */
  amarelosNoCiclo: number;
  /** Jogos de suspensão que ainda faltam cumprir. */
  jogosAPagar: number;
  status: StatusSuspensao;
};

export type RegraSuspensao = {
  amarelosParaSuspensao: number;
  jogosPorAmarelos: number;
  jogosPorVermelho: number;
};

/**
 * Situação de cada atleta depois dos jogos informados, em ordem cronológica.
 * `atletaTime` diz o time de cada atleta (para saber quais jogos ele cumpre).
 */
export function calcularSuspensoes(
  jogos: JogoComCartoes[],
  atletaTime: Map<string, string>,
  regra: RegraSuspensao
): Map<string, SituacaoAtleta> {
  const estado = new Map<string, { amarelos: number; aPagar: number }>();
  const pegar = (id: string) => {
    let e = estado.get(id);
    if (!e) estado.set(id, (e = { amarelos: 0, aPagar: 0 }));
    return e;
  };

  for (const jogo of jogos) {
    // Quem chegou a este jogo com suspensão pendente cumpre um jogo nele.
    for (const [atletaId, e] of estado) {
      const time = atletaTime.get(atletaId);
      if (e.aPagar > 0 && time && jogo.timeIds.includes(time)) e.aPagar -= 1;
    }
    // Cartões deste jogo geram suspensão para os próximos.
    for (const c of jogo.cartoes) {
      const e = pegar(c.atletaId);
      if (c.tipo === "CARTAO_VERMELHO") {
        e.aPagar += regra.jogosPorVermelho;
      } else {
        e.amarelos += 1;
        if (e.amarelos >= regra.amarelosParaSuspensao) {
          e.amarelos -= regra.amarelosParaSuspensao;
          e.aPagar += regra.jogosPorAmarelos;
        }
      }
    }
  }

  const resultado = new Map<string, SituacaoAtleta>();
  for (const [atletaId, e] of estado) {
    const status: StatusSuspensao =
      e.aPagar > 0 ? "suspenso" : e.amarelos === regra.amarelosParaSuspensao - 1 ? "pendurado" : "ok";
    resultado.set(atletaId, { amarelosNoCiclo: e.amarelos, jogosAPagar: e.aPagar, status });
  }
  return resultado;
}

/**
 * Situação dos atletas da categoria pelos jogos encerrados. Com `antesDe`,
 * só conta os jogos marcados antes dessa data (a súmula de um jogo olha a
 * situação de quando ele começou).
 */
export async function getSituacaoSuspensoes(
  tenantId: string,
  categoriaId: string,
  opts?: { antesDe?: Date; excetoPartidaId?: string }
): Promise<Map<string, SituacaoAtleta>> {
  const db = getTenantPrisma(tenantId);
  const [categoria, partidas] = await Promise.all([
    db.categoria.findUnique({
      where: { id: categoriaId },
      select: { cartoesParaSuspensao: true, jogosSuspensao: true },
    }),
    db.partida.findMany({
      where: {
        categoriaId,
        status: "ENCERRADA",
        ...(opts?.antesDe ? { dataHora: { lt: opts.antesDe } } : {}),
        ...(opts?.excetoPartidaId ? { id: { not: opts.excetoPartidaId } } : {}),
      },
      orderBy: [{ dataHora: "asc" }, { createdAt: "asc" }],
      select: {
        timeCasaId: true,
        timeForaId: true,
        eventos: {
          where: { tipo: { in: ["CARTAO_AMARELO", "CARTAO_VERMELHO"] }, atletaId: { not: null } },
          select: { atletaId: true, tipo: true, atleta: { select: { timeId: true } } },
        },
      },
    }),
  ]);

  const atletaTime = new Map<string, string>();
  const jogos: JogoComCartoes[] = partidas.map((p) => ({
    timeIds: [p.timeCasaId, p.timeForaId],
    cartoes: p.eventos.map((e) => {
      if (e.atleta) atletaTime.set(e.atletaId!, e.atleta.timeId);
      return { atletaId: e.atletaId!, tipo: e.tipo as CartaoNoJogo["tipo"] };
    }),
  }));

  return calcularSuspensoes(jogos, atletaTime, {
    amarelosParaSuspensao: categoria?.cartoesParaSuspensao ?? 3,
    jogosPorAmarelos: categoria?.jogosSuspensao ?? 1,
    jogosPorVermelho: 1,
  });
}
