import type { getTenantPrisma } from "@/lib/tenant-prisma";

export const ERRO_TREINADOR_MESMA_CATEGORIA =
  "Este treinador já tem um time nesta categoria. Um treinador pode ter vários times, mas só um por categoria.";

/**
 * Um treinador pode comandar vários times, desde que cada um esteja numa
 * categoria diferente. `excetoTimeId` ignora o próprio time ao editá-lo.
 */
export async function treinadorTemTimeNaCategoria(
  db: ReturnType<typeof getTenantPrisma>,
  treinadorId: string,
  categoriaId: string,
  excetoTimeId?: string
) {
  const time = await db.time.findFirst({
    where: { treinadorId, categoriaId, ...(excetoTimeId ? { id: { not: excetoTimeId } } : {}) },
    select: { id: true },
  });
  return !!time;
}
