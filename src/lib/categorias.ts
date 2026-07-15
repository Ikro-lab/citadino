import { prisma } from "@/lib/prisma";

export async function listCategoriasAtivas() {
  const categorias = await prisma.categoria.findMany({
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

export async function resolveCategoriaId(preferido?: string) {
  const categorias = await listCategoriasAtivas();
  if (preferido && categorias.some((c) => c.id === preferido)) {
    return { categoriaId: preferido, categorias };
  }
  return { categoriaId: categorias[0]?.id ?? null, categorias };
}
