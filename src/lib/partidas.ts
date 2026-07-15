import { prisma } from "@/lib/prisma";
import { dayRange } from "@/lib/date-utils";

export { dayRange, todayStr, shiftDateStr } from "@/lib/date-utils";

export async function getFeed(categoriaId: string, dateStr: string) {
  const { start, end } = dayRange(dateStr);

  return prisma.partida.findMany({
    where: {
      categoriaId,
      dataHora: { gte: start, lte: end },
    },
    orderBy: { dataHora: "asc" },
    include: {
      timeCasa: { select: { id: true, nome: true, escudoUrl: true } },
      timeFora: { select: { id: true, nome: true, escudoUrl: true } },
      categoria: { select: { id: true, nome: true } },
    },
  });
}

export async function getFeedAgrupado(dateStr: string) {
  const { start, end } = dayRange(dateStr);

  const partidas = await prisma.partida.findMany({
    where: {
      dataHora: { gte: start, lte: end },
      categoria: { campeonato: { ativo: true } },
    },
    orderBy: [{ categoriaId: "asc" }, { dataHora: "asc" }],
    include: {
      timeCasa: { select: { id: true, nome: true, escudoUrl: true } },
      timeFora: { select: { id: true, nome: true, escudoUrl: true } },
      categoria: { select: { id: true, nome: true } },
    },
  });

  const grupos = new Map<
    string,
    { categoriaId: string; categoriaNome: string; partidas: typeof partidas }
  >();
  for (const p of partidas) {
    if (!grupos.has(p.categoriaId)) {
      grupos.set(p.categoriaId, {
        categoriaId: p.categoriaId,
        categoriaNome: p.categoria.nome,
        partidas: [],
      });
    }
    grupos.get(p.categoriaId)!.partidas.push(p);
  }

  return Array.from(grupos.values());
}

const RESULTADOS_FORMA = 5;

export async function getFormaRecente(timeId: string) {
  const partidas = await prisma.partida.findMany({
    where: {
      status: "ENCERRADA",
      OR: [{ timeCasaId: timeId }, { timeForaId: timeId }],
    },
    orderBy: { dataHora: "desc" },
    take: RESULTADOS_FORMA,
    select: { timeCasaId: true, placarCasa: true, placarFora: true },
  });

  return partidas
    .map((p): "V" | "E" | "D" => {
      const isCasa = p.timeCasaId === timeId;
      const golsPro = isCasa ? p.placarCasa : p.placarFora;
      const golsContra = isCasa ? p.placarFora : p.placarCasa;
      if (golsPro > golsContra) return "V";
      if (golsPro < golsContra) return "D";
      return "E";
    })
    .reverse();
}

export async function getFormaRecenteEmLote(timeIds: string[]) {
  const unicos = Array.from(new Set(timeIds));
  const entradas = await Promise.all(
    unicos.map(async (id) => [id, await getFormaRecente(id)] as const)
  );
  return Object.fromEntries(entradas) as Record<string, ("V" | "E" | "D")[]>;
}

export async function getPartidaDetalhe(id: string) {
  return prisma.partida.findUnique({
    where: { id },
    include: {
      timeCasa: {
        select: {
          id: true,
          nome: true,
          escudoUrl: true,
          atletas: {
            select: { id: true, nome: true, numero: true, posicao: true },
            orderBy: { numero: "asc" },
          },
        },
      },
      timeFora: {
        select: {
          id: true,
          nome: true,
          escudoUrl: true,
          atletas: {
            select: { id: true, nome: true, numero: true, posicao: true },
            orderBy: { numero: "asc" },
          },
        },
      },
      categoria: { select: { id: true, nome: true } },
      eventos: {
        orderBy: { minuto: "asc" },
        include: {
          atleta: { select: { id: true, nome: true, numero: true } },
          time: { select: { id: true, nome: true } },
        },
      },
    },
  });
}

export type FeedPartida = Awaited<ReturnType<typeof getFeed>>[number];
export type FeedGrupo = Awaited<ReturnType<typeof getFeedAgrupado>>[number];
export type PartidaDetalhe = NonNullable<
  Awaited<ReturnType<typeof getPartidaDetalhe>>
>;
