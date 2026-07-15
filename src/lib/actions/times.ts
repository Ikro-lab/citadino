"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";

export async function createTime(formData: FormData) {
  await requireAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const categoriaId = String(formData.get("categoriaId") || "");
  const treinadorId = String(formData.get("treinadorId") || "") || null;
  const escudoUrl = String(formData.get("escudoUrl") || "").trim() || null;
  if (!nome || !categoriaId) return;

  await prisma.time.create({
    data: { nome, categoriaId, treinadorId, escudoUrl },
  });
  revalidatePath("/admin/times");
}

export async function updateTime(id: string, formData: FormData) {
  await requireAdmin();
  const nome = String(formData.get("nome") || "").trim();
  const categoriaId = String(formData.get("categoriaId") || "");
  const treinadorId = String(formData.get("treinadorId") || "") || null;
  const escudoUrl = String(formData.get("escudoUrl") || "").trim() || null;
  if (!nome || !categoriaId) return;

  await prisma.time.update({
    where: { id },
    data: { nome, categoriaId, treinadorId, escudoUrl },
  });
  revalidatePath("/admin/times");
  revalidatePath(`/admin/times/${id}`);
}

export async function deleteTime(id: string) {
  await requireAdmin();
  await prisma.time.delete({ where: { id } });
  revalidatePath("/admin/times");
}
