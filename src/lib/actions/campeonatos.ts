"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";

export async function createCampeonato(formData: FormData) {
  await requireAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const temporada = String(formData.get("temporada") || "").trim();
  if (!nome || !temporada) return;

  await prisma.campeonato.create({ data: { nome, temporada } });
  revalidatePath("/admin/campeonatos");
}

export async function toggleCampeonatoAtivo(id: string, ativo: boolean) {
  await requireAdmin();
  await prisma.campeonato.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/campeonatos");
}

export async function deleteCampeonato(id: string) {
  await requireAdmin();
  await prisma.campeonato.delete({ where: { id } });
  revalidatePath("/admin/campeonatos");
}
