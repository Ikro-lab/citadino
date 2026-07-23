"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { saveUpload } from "@/lib/storage";
import { paths } from "@/lib/tenant-path";
import type { FormatoDisputa } from "@prisma/client";

export async function createCategoria(formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const nome = String(formData.get("nome") || "").trim();
  const campeonatoId = String(formData.get("campeonatoId") || "");
  if (!nome || !campeonatoId) return;

  await db.categoria.create({ data: { tenantId: session.user.tenantId!, nome, campeonatoId } });
  revalidatePath(paths.admin.categorias(session.user.tenantSlug!));
}

export async function updateCategoria(id: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const nome = String(formData.get("nome") || "").trim();
  const formato = String(formData.get("formato") || "PONTOS_CORRIDOS") as FormatoDisputa;
  const classificadosPorGrupoRaw = String(formData.get("classificadosPorGrupo") || "");
  const classificadosPorGrupo = classificadosPorGrupoRaw ? Number(classificadosPorGrupoRaw) : null;
  const cartoesParaSuspensao = Number(formData.get("cartoesParaSuspensao")) || 3;
  const jogosSuspensao = Number(formData.get("jogosSuspensao")) || 1;
  if (!nome) return;

  await db.categoria.update({
    where: { id },
    data: { nome, formato, classificadosPorGrupo, cartoesParaSuspensao, jogosSuspensao },
  });
  revalidatePath(paths.admin.categorias(session.user.tenantSlug!));
  revalidatePath(paths.admin.categoria(session.user.tenantSlug!, id));
}

export async function uploadRegulamentoCategoria(id: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const arquivo = formData.get("regulamento");
  if (!(arquivo instanceof File) || arquivo.size === 0) return;

  const url = await saveUpload(arquivo, "regulamentos");
  await db.categoria.update({ where: { id }, data: { regulamentoUrl: url } });
  revalidatePath(paths.admin.categoria(session.user.tenantSlug!, id));
  revalidatePath(paths.classificacao(session.user.tenantSlug!));
}

export async function deleteCategoria(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.categoria.delete({ where: { id } });
  revalidatePath(paths.admin.categorias(session.user.tenantSlug!));
}
