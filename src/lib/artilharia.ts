import { prisma } from "@/lib/prisma";

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

export async function getArtilharia(categoriaId: string): Promise<ArtilheiroLinha[]> {
  const categoria = await prisma.categoria.findUnique({
    where: { id: categoriaId },
    select: { cartoesParaSuspensao: true },
  });
  const limite = categoria?.cartoesParaSuspensao ?? 3;

  const eventos = await prisma.eventoPartida.findMany({
    where: {
      atletaId: { not: null },
      tipo: { in: ["GOL", "CARTAO_AMARELO", "CARTAO_VERMELHO"] },
      partida: { categoriaId },
    },
    select: {
      atletaId: true,
      tipo: true,
      atleta: {
        select: { id: true, nome: true, numero: true, time: { select: { nome: true } } },
      },
    },
  });

  const map = new Map<string, Omit<ArtilheiroLinha, "statusSuspensao">>();
  for (const e of eventos) {
    if (!e.atletaId || !e.atleta) continue;
    if (!map.has(e.atletaId)) {
      map.set(e.atletaId, {
        atletaId: e.atletaId,
        nome: e.atleta.nome,
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
    .map((linha) => ({ ...linha, statusSuspensao: suspensaoStatus(linha.amarelos, limite) }))
    .sort((a, b) => b.gols - a.gols || a.nome.localeCompare(b.nome));
}

function suspensaoStatus(amarelos: number, limite: number): ArtilheiroLinha["statusSuspensao"] {
  if (amarelos > 0 && amarelos % limite === 0) return "suspenso";
  if (amarelos % limite === limite - 1) return "pendurado";
  return "ok";
}

/**
 * IDs de atletas suspensos para a próxima partida por acúmulo de cartões
 * amarelos, conforme o limite configurado na categoria. Simplificação: não
 * rastreia se a suspensão já foi "cumprida" em uma partida específica —
 * assume que o atleta segue suspenso enquanto o total de amarelos estiver em
 * um múltiplo exato do limite.
 */
export async function getAtletasSuspensosIds(categoriaId: string): Promise<Set<string>> {
  const linhas = await getArtilharia(categoriaId);
  return new Set(linhas.filter((l) => l.statusSuspensao === "suspenso").map((l) => l.atletaId));
}
