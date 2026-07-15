"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";

export async function createCategoria(formData: FormData) {
  await requireAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const campeonatoId = String(formData.get("campeonatoId") || "");
  if (!nome || !campeonatoId) return;

  await prisma.categoria.create({ data: { nome, campeonatoId } });
  revalidatePath("/admin/categorias");
}

export async function deleteCategoria(id: string) {
  await requireAdmin();
  await prisma.categoria.delete({ where: { id } });
  revalidatePath("/admin/categorias");
}
