import "server-only";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { nomeDoAtleta } from "@/lib/labels";
import { curtidasExibidas } from "@/lib/curtidas";
import { dayRange, formatDatetimeLocalBRT, todayStr } from "@/lib/date-utils";
import type { Prisma } from "@prisma/client";

export const GOLS_POR_PAGINA = 10;

export type OrdemFeed = "recentes" | "dia" | "curtidos";

/** Cookie com a categoria escolhida em Recentes (id ou "todas"). */
export const COOKIE_CATEGORIA_GOLS = "citadino_gols_categoria";

export type GolDoFeed = {
  id: string;
  videoUrl: string;
  minuto: number;
  autor: string | null;
  numero: number | null;
  atletaId: string | null;
  time: string;
  timeCasa: string;
  timeFora: string;
  /** Placar logo depois deste gol (pela ordem dos lances). */
  placarCasa: number;
  placarFora: number;
  categoria: string;
  partidaId: string;
  /** Como este aparelho vê o total (ver curtidasExibidas). */
  curtidas: number;
  curtido: boolean;
};

type Db = ReturnType<typeof getTenantPrisma>;

const GOL_COM_VIDEO = {
  tipo: "GOL",
  videoUrl: { not: null },
  partida: { categoria: { campeonato: { ativo: true } } },
} satisfies Prisma.EventoPartidaWhereInput;

/** Categorias dos campeonatos ativos, com quantos gols em vídeo cada uma tem. */
export async function categoriasDoFeed(tenantId: string) {
  const db = getTenantPrisma(tenantId);
  const categorias = await db.categoria.findMany({
    where: { campeonato: { ativo: true } },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });
  const totais = await Promise.all(
    categorias.map((c) =>
      db.eventoPartida.count({ where: { ...GOL_COM_VIDEO, partida: { categoriaId: c.id, categoria: { campeonato: { ativo: true } } } } })
    )
  );
  return categorias.map((c, i) => ({ ...c, gols: totais[i] }));
}

/** Último dia (horário de Brasília) com gol em vídeo: hoje, se já teve. */
async function ultimoDiaComGol(db: Db) {
  const ultimo = await db.eventoPartida.findFirst({
    where: GOL_COM_VIDEO,
    orderBy: { partida: { dataHora: "desc" } },
    select: { partida: { select: { dataHora: true } } },
  });
  return ultimo ? formatDatetimeLocalBRT(ultimo.partida.dataHora).slice(0, 10) : null;
}

/**
 * Gols com vídeo dos campeonatos ativos, um pedaço da rolagem por vez.
 * `dia`: os gols do último dia com jogo (devolve `diaRotulo`, "Hoje" ou a data).
 */
export async function buscarFeedGols(
  tenantId: string,
  filtro: { ordem: OrdemFeed; categoriaId?: string | null },
  pular: number,
  deviceId: string | null
): Promise<{ gols: GolDoFeed[]; temMais: boolean; diaRotulo?: string }> {
  const db = getTenantPrisma(tenantId);
  const { ordem } = filtro;
  const partida: Prisma.PartidaWhereInput = { categoria: { campeonato: { ativo: true } } };
  if (ordem === "recentes" && filtro.categoriaId) partida.categoriaId = filtro.categoriaId;

  let diaRotulo: string | undefined;
  if (ordem === "dia") {
    const dia = await ultimoDiaComGol(db);
    if (!dia) return { gols: [], temMais: false };
    const { start, end } = dayRange(dia);
    partida.dataHora = { gte: start, lte: end };
    diaRotulo = dia === todayStr() ? "Hoje" : `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
  }

  const eventos = await db.eventoPartida.findMany({
    where: { ...GOL_COM_VIDEO, partida },
    orderBy:
      ordem === "curtidos"
        ? [{ curtidas: { _count: "desc" } }, { createdAt: "desc" }]
        : [{ partida: { dataHora: "desc" } }, { minuto: "desc" }, { createdAt: "desc" }],
    skip: pular,
    take: GOLS_POR_PAGINA + 1,
    include: {
      atleta: { select: { id: true, nome: true, apelido: true, numero: true } },
      _count: { select: { curtidas: true } },
      // Sem cookie, ninguém curtiu nada ainda.
      curtidas: { where: { deviceId: deviceId ?? "-" }, select: { id: true } },
      partida: {
        select: {
          id: true,
          categoria: { select: { nome: true } },
          timeCasa: { select: { id: true, nome: true } },
          timeFora: { select: { id: true, nome: true } },
          eventos: {
            where: { tipo: "GOL" },
            select: { id: true, timeId: true },
            orderBy: [{ minuto: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

  const gols = eventos.slice(0, GOLS_POR_PAGINA).map((e): GolDoFeed => {
    const { partida } = e;
    const ate = partida.eventos.slice(0, partida.eventos.findIndex((g) => g.id === e.id) + 1);
    const placarCasa = ate.filter((g) => g.timeId === partida.timeCasa.id).length;
    return {
      id: e.id,
      videoUrl: e.videoUrl!,
      minuto: e.minuto,
      autor: e.atleta ? nomeDoAtleta(e.atleta) : null,
      numero: e.atleta?.numero ?? null,
      atletaId: e.atleta?.id ?? null,
      time: e.timeId === partida.timeCasa.id ? partida.timeCasa.nome : partida.timeFora.nome,
      timeCasa: partida.timeCasa.nome,
      timeFora: partida.timeFora.nome,
      placarCasa,
      placarFora: ate.length - placarCasa,
      categoria: partida.categoria.nome,
      partidaId: partida.id,
      curtidas: curtidasExibidas(e._count.curtidas, e.curtidas.length > 0),
      curtido: e.curtidas.length > 0,
    };
  });
  return { gols, temMais: eventos.length > GOLS_POR_PAGINA, diaRotulo };
}
