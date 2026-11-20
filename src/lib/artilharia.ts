import { getTenantPrisma } from "@/lib/tenant-prisma";
import { nomeDoAtleta } from "@/lib/labels";
import { getSituacaoSuspensoes } from "@/lib/suspensoes";

export type ArtilheiroLinha = {
  atletaId: string;
  nome: string;
  numero: number;
  timeNome: string;
  gols: number;
  amarelos: number;
  vermelhos: number;
  statusSuspensao: "ok" | "pendurado" | "suspenso";
};

export async function getArtilharia(tenantId: string, categoriaId: string): Promise<ArtilheiroLinha[]> {
  const db = getTenantPrisma(tenantId);
  const situacao = await getSituacaoSuspensoes(tenantId, categoriaId);

  const eventos = await db.eventoPartida.findMany({
    where: {
      atletaId: { not: null },
      tipo: { in: ["GOL", "CARTAO_AMARELO", "CARTAO_VERMELHO"] },
      partida: { categoriaId },
    },
    select: {
      atletaId: true,
      tipo: true,
      atleta: {
        select: { id: true, nome: true, apelido: true, numero: true, time: { select: { nome: true } } },
      },
    },
  });

  const map = new Map<string, Omit<ArtilheiroLinha, "statusSuspensao">>();
  for (const e of eventos) {
    if (!e.atletaId || !e.atleta) continue;
    if (!map.has(e.atletaId)) {
      map.set(e.atletaId, {
        atletaId: e.atletaId,
        nome: nomeDoAtleta(e.atleta),
        numero: e.atleta.numero,
        timeNome: e.atleta.time.nome,
        gols: 0,
        amarelos: 0,
        vermelhos: 0,
      });
    }
    const linha = map.get(e.atletaId)!;
    if (e.tipo === "GOL") linha.gols += 1;
    else if (e.tipo === "CARTAO_AMARELO") linha.amarelos += 1;
    else if (e.tipo === "CARTAO_VERMELHO") linha.vermelhos += 1;
  }

  return Array.from(map.values())
    .map((linha) => ({ ...linha, statusSuspensao: situacao.get(linha.atletaId)?.status ?? "ok" }))
    .sort((a, b) => b.gols - a.gols || a.nome.localeCompare(b.nome));
}

/**
 * IDs de atletas suspensos (amarelos acumulados ou vermelho, ver
 * `src/lib/suspensoes.ts`). Com `partida`, a situação de antes daquele jogo:
 * a suspensão cumprida nele não some da súmula dele.
 */
export async function getAtletasSuspensosIds(
  tenantId: string,
  categoriaId: string,
  partida?: { id: string; dataHora: Date }
): Promise<Set<string>> {
  const situacao = await getSituacaoSuspensoes(
    tenantId,
    categoriaId,
    partida ? { antesDe: partida.dataHora, excetoPartidaId: partida.id } : undefined
  );
  return new Set([...situacao].filter(([, s]) => s.status === "suspenso").map(([id]) => id));
}
