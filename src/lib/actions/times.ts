"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";

export async function createTime(formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const nome = String(formData.get("nome") || "").trim();
  const categoriaId = String(formData.get("categoriaId") || "");
  const treinadorId = String(formData.get("treinadorId") || "") || null;
  const escudoUrl = String(formData.get("escudoUrl") || "").trim() || null;
  if (!nome || !categoriaId) return;

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
  const escudoUrl = String(formData.get("escudoUrl") || "").trim() || null;
  if (!nome || !categoriaId) return;

  await db.time.update({
    where: { id },
    data: { nome, categoriaId, treinadorId, escudoUrl },
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
