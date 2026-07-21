import { prisma } from "@/lib/prisma";

const ORDEM_NIVEL = { MASTER: 0, OURO: 1, PRATA: 2 } as const;

export async function getPatrocinadoresAtivos() {
  const patrocinadores = await prisma.patrocinador.findMany({
    where: { ativo: true, campeonato: { ativo: true } },
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
  });

  return patrocinadores.sort((a, b) => ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel]);
}
