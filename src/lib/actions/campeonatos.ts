"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { saveUpload } from "@/lib/storage";

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

export async function uploadRegulamentoCampeonato(id: string, formData: FormData) {
  await requireAdmin();
  const arquivo = formData.get("regulamento");
  if (!(arquivo instanceof File) || arquivo.size === 0) return;

  const url = await saveUpload(arquivo, "regulamentos");
  await prisma.campeonato.update({ where: { id }, data: { regulamentoUrl: url } });
  revalidatePath("/admin/campeonatos");
  revalidatePath("/classificacao");
}

export async function deleteCampeonato(id: string) {
  await requireAdmin();
  await prisma.campeonato.delete({ where: { id } });
  revalidatePath("/admin/campeonatos");
}
