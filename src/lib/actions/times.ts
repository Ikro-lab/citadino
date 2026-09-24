"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { saveUpload } from "@/lib/storage";

async function escudoEnviado(formData: FormData): Promise<string | null> {
  const arquivo = formData.get("escudo");
  return arquivo instanceof File && arquivo.size > 0 ? saveUpload(arquivo, "escudos") : null;
}

export async function createTime(formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const nome = String(formData.get("nome") || "").trim();
  const categoriaId = String(formData.get("categoriaId") || "");
  const treinadorId = String(formData.get("treinadorId") || "") || null;
  if (!nome || !categoriaId) return;
  const escudoUrl = await escudoEnviado(formData);

  await db.time.create({
    data: { tenantId: session.user.tenantId!, nome, categoriaId, treinadorId, escudoUrl },
  });
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
}

export async function updateTime(id: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const nome = String(formData.get("nome") || "").trim();
  const categoriaId = String(formData.get("categoriaId") || "");
  const treinadorId = String(formData.get("treinadorId") || "") || null;
  if (!nome || !categoriaId) return;
  // Sem foto nova, o escudo atual continua.
  const escudoUrl = await escudoEnviado(formData);

  await db.time.update({
    where: { id },
    data: { nome, categoriaId, treinadorId, ...(escudoUrl ? { escudoUrl } : {}) },
  });
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
  revalidatePath(paths.admin.time(session.user.tenantSlug!, id));
}

export async function deleteTime(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.time.delete({ where: { id } });
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
}
