import { getTenantPrisma } from "@/lib/tenant-prisma";

const ORDEM_NIVEL = { MASTER: 0, OURO: 1, PRATA: 2 } as const;

export async function getPatrocinadoresAtivos(tenantId: string) {
  const db = getTenantPrisma(tenantId);
  const patrocinadores = await db.patrocinador.findMany({
    where: { ativo: true, campeonato: { ativo: true } },
    orderBy: [{ ordem: "asc" }, { createdAt: "asc" }],
  });

  return patrocinadores.sort((a, b) => ORDEM_NIVEL[a.nivel] - ORDEM_NIVEL[b.nivel]);
}
