"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { saveUpload } from "@/lib/storage";
import type { FormatoDisputa } from "@prisma/client";

export async function createCategoria(formData: FormData) {
  await requireAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const campeonatoId = String(formData.get("campeonatoId") || "");
  if (!nome || !campeonatoId) return;

  await prisma.categoria.create({ data: { nome, campeonatoId } });
  revalidatePath("/admin/categorias");
}

export async function updateCategoria(id: string, formData: FormData) {
  await requireAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const formato = String(formData.get("formato") || "PONTOS_CORRIDOS") as FormatoDisputa;
  const classificadosPorGrupoRaw = String(formData.get("classificadosPorGrupo") || "");
  const classificadosPorGrupo = classificadosPorGrupoRaw ? Number(classificadosPorGrupoRaw) : null;
  const cartoesParaSuspensao = Number(formData.get("cartoesParaSuspensao")) || 3;
  const jogosSuspensao = Number(formData.get("jogosSuspensao")) || 1;
  if (!nome) return;

  await prisma.categoria.update({
    where: { id },
    data: { nome, formato, classificadosPorGrupo, cartoesParaSuspensao, jogosSuspensao },
  });
  revalidatePath("/admin/categorias");
  revalidatePath(`/admin/categorias/${id}`);
}

export async function uploadRegulamentoCategoria(id: string, formData: FormData) {
  await requireAdmin();
  const arquivo = formData.get("regulamento");
  if (!(arquivo instanceof File) || arquivo.size === 0) return;

  const url = await saveUpload(arquivo, "regulamentos");
  await prisma.categoria.update({ where: { id }, data: { regulamentoUrl: url } });
  revalidatePath(`/admin/categorias/${id}`);
  revalidatePath("/classificacao");
}

export async function deleteCategoria(id: string) {
  await requireAdmin();
  await prisma.categoria.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}
