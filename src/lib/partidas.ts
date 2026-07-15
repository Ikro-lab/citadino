import { prisma } from "@/lib/prisma";

export function dayRange(dateStr: string) {
  const start = new Date(`${dateStr}T00:00:00`);
  const end = new Date(`${dateStr}T23:59:59.999`);
  return { start, end };
}

export function todayStr() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 10);
}

export function shiftDateStr(dateStr: string, deltaDays: number) {
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

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
      categoria: { select: { nome: true } },
    },
  });
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
export type PartidaDetalhe = NonNullable<
  Awaited<ReturnType<typeof getPartidaDetalhe>>
>;
