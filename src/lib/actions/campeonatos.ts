"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { saveUpload } from "@/lib/storage";
import { paths } from "@/lib/tenant-path";

export async function createCampeonato(formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const nome = String(formData.get("nome") || "").trim();
  const temporada = String(formData.get("temporada") || "").trim();
  if (!nome || !temporada) return;

  await db.campeonato.create({ data: { tenantId: session.user.tenantId!, nome, temporada } });
  revalidatePath(paths.admin.campeonatos(session.user.tenantSlug!));
}

export async function toggleCampeonatoAtivo(id: string, ativo: boolean) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.campeonato.update({ where: { id }, data: { ativo } });
  revalidatePath(paths.admin.campeonatos(session.user.tenantSlug!));
}

export async function uploadRegulamentoCampeonato(id: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const arquivo = formData.get("regulamento");
  if (!(arquivo instanceof File) || arquivo.size === 0) return;

  const url = await saveUpload(arquivo, "regulamentos");
  await db.campeonato.update({ where: { id }, data: { regulamentoUrl: url } });
  revalidatePath(paths.admin.campeonatos(session.user.tenantSlug!));
  revalidatePath(paths.classificacao(session.user.tenantSlug!));
}

export async function deleteCampeonato(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.campeonato.delete({ where: { id } });
  revalidatePath(paths.admin.campeonatos(session.user.tenantSlug!));
}
