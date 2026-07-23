"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { saveLogoUpload } from "@/lib/storage";
import { paths } from "@/lib/tenant-path";
import type { NivelPatrocinio } from "@prisma/client";

export async function createPatrocinador(formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);

  const nome = String(formData.get("nome") || "").trim();
  const campeonatoId = String(formData.get("campeonatoId") || "");
  const linkUrl = String(formData.get("linkUrl") || "").trim() || null;
  const nivel = String(formData.get("nivel") || "PRATA") as NivelPatrocinio;
  const ordem = Number(formData.get("ordem")) || 0;
  const logo = formData.get("logo");

  if (!nome || !campeonatoId || !(logo instanceof File) || logo.size === 0) return;

  const logoUrl = await saveLogoUpload(logo, "patrocinadores");

  await db.patrocinador.create({
    data: { tenantId: session.user.tenantId!, nome, campeonatoId, linkUrl, nivel, ordem, logoUrl },
  });

  revalidatePath(paths.admin.patrocinadores(session.user.tenantSlug!));
  revalidatePath(paths.home(session.user.tenantSlug!));
}

export async function updatePatrocinador(id: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);

  const nome = String(formData.get("nome") || "").trim();
  const linkUrl = String(formData.get("linkUrl") || "").trim() || null;
  const nivel = String(formData.get("nivel") || "PRATA") as NivelPatrocinio;
  const ordem = Number(formData.get("ordem")) || 0;
  if (!nome) return;

  const logo = formData.get("logo");
  const logoUrl = logo instanceof File && logo.size > 0 ? await saveLogoUpload(logo, "patrocinadores") : undefined;

  await db.patrocinador.update({
    where: { id },
    data: { nome, linkUrl, nivel, ordem, ...(logoUrl ? { logoUrl } : {}) },
  });

  revalidatePath(paths.admin.patrocinadores(session.user.tenantSlug!));
  revalidatePath(paths.home(session.user.tenantSlug!));
}

export async function toggleAtivoPatrocinador(id: string, ativo: boolean) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.patrocinador.update({ where: { id }, data: { ativo } });
  revalidatePath(paths.admin.patrocinadores(session.user.tenantSlug!));
  revalidatePath(paths.home(session.user.tenantSlug!));
}

export async function deletePatrocinador(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.patrocinador.delete({ where: { id } });
  revalidatePath(paths.admin.patrocinadores(session.user.tenantSlug!));
  revalidatePath(paths.home(session.user.tenantSlug!));
}
