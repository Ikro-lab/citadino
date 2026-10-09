"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { saveUpload } from "@/lib/storage";
import { auth } from "@/auth";

async function escudoEnviado(formData: FormData): Promise<string | null> {
  const arquivo = formData.get("escudo");
  return arquivo instanceof File && arquivo.size > 0 ? saveUpload(arquivo, "escudos") : null;
}

export type CriarMeuTimeState = { error?: string } | undefined;

/**
 * Treinador que entrou pelo link de cadastro de uma categoria cria o próprio
 * time (nome + escudo). A categoria vem da conta dele, não do formulário.
 */
export async function criarMeuTime(_prev: CriarMeuTimeState, formData: FormData): Promise<CriarMeuTimeState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "TREINADOR") return { error: "Entre com sua conta de treinador." };
  const tenantId = session.user.tenantId!;
  const db = getTenantPrisma(tenantId);

  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { categoriaConviteId: true } });
  if (!user?.categoriaConviteId) return { error: "Sua conta não veio do link de uma categoria. Fale com o organizador." };
  const categoria = await db.categoria.findUnique({ where: { id: user.categoriaConviteId }, select: { id: true } });
  if (!categoria) return { error: "A categoria do seu link não existe mais. Fale com o organizador." };

  const nome = String(formData.get("nome") || "").trim();
  if (nome.length < 2) return { error: "Informe o nome do time." };
  const repetido = await db.time.findFirst({ where: { categoriaId: categoria.id, nome }, select: { id: true } });
  if (repetido) return { error: "Já existe um time com esse nome nesta categoria." };

  let escudoUrl: string | null;
  try {
    escudoUrl = await escudoEnviado(formData);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Não foi possível enviar o escudo." };
  }

  await db.time.create({ data: { tenantId, nome, categoriaId: categoria.id, treinadorId: session.user.id, escudoUrl } });
  await db.user.update({ where: { id: session.user.id }, data: { categoriaConviteId: null } });

  revalidatePath(paths.treinador.root(session.user.tenantSlug!));
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
  return {};
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
