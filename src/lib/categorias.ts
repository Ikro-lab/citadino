import { getTenantPrisma } from "@/lib/tenant-prisma";

export async function listCategoriasAtivas(tenantId: string) {
  const db = getTenantPrisma(tenantId);
  const categorias = await db.categoria.findMany({
    where: { campeonato: { ativo: true } },
    include: { campeonato: { select: { nome: true } } },
    orderBy: [{ campeonatoId: "asc" }, { nome: "asc" }],
  });

  const campeonatosAtivos = new Set(categorias.map((c) => c.campeonato.nome))
    .size;

  return categorias.map((c) => ({
    id: c.id,
    nome: c.nome,
    label: campeonatosAtivos > 1 ? `${c.campeonato.nome} · ${c.nome}` : c.nome,
  }));
}

export async function resolveCategoriaId(tenantId: string, preferido?: string) {
  const categorias = await listCategoriasAtivas(tenantId);
  if (preferido && categorias.some((c) => c.id === preferido)) {
    return { categoriaId: preferido, categorias };
  }
  return { categoriaId: categorias[0]?.id ?? null, categorias };
}
