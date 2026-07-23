"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";

export async function createGrupo(categoriaId: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const nome = String(formData.get("nome") || "").trim();
  if (!nome) return;

  await db.grupo.create({ data: { tenantId: session.user.tenantId!, nome, categoriaId } });
  revalidatePath(paths.admin.categoria(session.user.tenantSlug!, categoriaId));
}

export async function deleteGrupo(id: string, categoriaId: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.grupo.delete({ where: { id } });
  revalidatePath(paths.admin.categoria(session.user.tenantSlug!, categoriaId));
}

export async function atribuirGrupoDoTime(
  timeId: string,
  categoriaId: string,
  formData: FormData
) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const grupoId = String(formData.get("grupoId") || "") || null;

  await db.time.update({ where: { id: timeId }, data: { grupoId } });
  revalidatePath(paths.admin.categoria(session.user.tenantSlug!, categoriaId));
}
