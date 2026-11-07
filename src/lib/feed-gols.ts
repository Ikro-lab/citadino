import "server-only";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { nomeDoAtleta } from "@/lib/labels";
import { MULTIPLICADOR_CURTIDAS } from "@/lib/curtidas";

export const GOLS_POR_PAGINA = 10;

export type OrdemFeed = "recentes" | "curtidos";

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
  /** Já multiplicado por MULTIPLICADOR_CURTIDAS. */
  curtidas: number;
  curtido: boolean;
};

/** Gols com vídeo dos campeonatos ativos, um pedaço da rolagem por vez. */
export async function buscarFeedGols(
  tenantId: string,
  ordem: OrdemFeed,
  pular: number,
  deviceId: string | null
): Promise<{ gols: GolDoFeed[]; temMais: boolean }> {
  const db = getTenantPrisma(tenantId);
  const eventos = await db.eventoPartida.findMany({
    where: {
      tipo: "GOL",
      videoUrl: { not: null },
      partida: { categoria: { campeonato: { ativo: true } } },
    },
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
      curtidas: e._count.curtidas * MULTIPLICADOR_CURTIDAS,
      curtido: e.curtidas.length > 0,
    };
  });
  return { gols, temMais: eventos.length > GOLS_POR_PAGINA };
}
