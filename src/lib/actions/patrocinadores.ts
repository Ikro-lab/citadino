"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { saveLogoUpload } from "@/lib/storage";
import type { NivelPatrocinio } from "@prisma/client";

export async function createPatrocinador(formData: FormData) {
  await requireAdmin();

  const nome = String(formData.get("nome") || "").trim();
  const campeonatoId = String(formData.get("campeonatoId") || "");
  const linkUrl = String(formData.get("linkUrl") || "").trim() || null;
  const nivel = String(formData.get("nivel") || "PRATA") as NivelPatrocinio;
  const ordem = Number(formData.get("ordem")) || 0;
  const logo = formData.get("logo");

  if (!nome || !campeonatoId || !(logo instanceof File) || logo.size === 0) return;

  const logoUrl = await saveLogoUpload(logo, "patrocinadores");

  await prisma.patrocinador.create({
    data: { nome, campeonatoId, linkUrl, nivel, ordem, logoUrl },
  });

  revalidatePath("/admin/patrocinadores");
  revalidatePath("/");
}

export async function updatePatrocinador(id: string, formData: FormData) {
  await requireAdmin();

  const nome = String(formData.get("nome") || "").trim();
  const linkUrl = String(formData.get("linkUrl") || "").trim() || null;
  const nivel = String(formData.get("nivel") || "PRATA") as NivelPatrocinio;
  const ordem = Number(formData.get("ordem")) || 0;
  if (!nome) return;

  const logo = formData.get("logo");
  const logoUrl = logo instanceof File && logo.size > 0 ? await saveLogoUpload(logo, "patrocinadores") : undefined;

  await prisma.patrocinador.update({
    where: { id },
    data: { nome, linkUrl, nivel, ordem, ...(logoUrl ? { logoUrl } : {}) },
  });

  revalidatePath("/admin/patrocinadores");
  revalidatePath("/");
}

export async function toggleAtivoPatrocinador(id: string, ativo: boolean) {
  await requireAdmin();
  await prisma.patrocinador.update({ where: { id }, data: { ativo } });
  revalidatePath("/admin/patrocinadores");
  revalidatePath("/");
}

export async function deletePatrocinador(id: string) {
  await requireAdmin();
  await prisma.patrocinador.delete({ where: { id } });
  revalidatePath("/admin/patrocinadores");
  revalidatePath("/");
}
