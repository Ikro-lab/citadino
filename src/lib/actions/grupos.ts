"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";

export async function createGrupo(categoriaId: string, formData: FormData) {
  await requireAdmin();
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) return;

  await prisma.grupo.create({ data: { nome, categoriaId } });
  revalidatePath(`/admin/categorias/${categoriaId}`);
}

export async function deleteGrupo(id: string, categoriaId: string) {
  await requireAdmin();
  await prisma.grupo.delete({ where: { id } });
  revalidatePath(`/admin/categorias/${categoriaId}`);
}

export async function atribuirGrupoDoTime(
  timeId: string,
  categoriaId: string,
  formData: FormData
) {
  await requireAdmin();
  const grupoId = String(formData.get("grupoId") || "") || null;

  await prisma.time.update({ where: { id: timeId }, data: { grupoId } });
  revalidatePath(`/admin/categorias/${categoriaId}`);
}
