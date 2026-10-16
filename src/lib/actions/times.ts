"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { saveLogoUpload } from "@/lib/storage";
import { auth } from "@/auth";
import { ERRO_TREINADOR_MESMA_CATEGORIA, treinadorTemTimeNaCategoria } from "@/lib/treinador-categoria";

/** Formulários do painel não têm estado: o erro volta na URL (?erro=). */
function voltarComErro(url: string, mensagem: string): never {
  redirect(`${url}?erro=${encodeURIComponent(mensagem)}`);
}

async function escudoEnviado(formData: FormData): Promise<string | null> {
  const arquivo = formData.get("escudo");
  // Como os logos de patrocinador: recorta a margem vazia e grava em PNG,
  // mantendo o fundo transparente.
  return arquivo instanceof File && arquivo.size > 0 ? saveLogoUpload(arquivo, "escudos") : null;
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
  if (await treinadorTemTimeNaCategoria(db, session.user.id, categoria.id)) {
    await db.user.update({ where: { id: session.user.id }, data: { categoriaConviteId: null } });
    revalidatePath(paths.treinador.root(session.user.tenantSlug!));
    return { error: "Você já tem um time nesta categoria. Para outro time, use o link de outra categoria." };
  }

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
  if (treinadorId && (await treinadorTemTimeNaCategoria(db, treinadorId, categoriaId))) {
    voltarComErro(paths.admin.times(session.user.tenantSlug!), ERRO_TREINADOR_MESMA_CATEGORIA);
  }
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
  if (treinadorId && (await treinadorTemTimeNaCategoria(db, treinadorId, categoriaId, id))) {
    voltarComErro(paths.admin.time(session.user.tenantSlug!, id), ERRO_TREINADOR_MESMA_CATEGORIA);
  }
  // Sem foto nova, o escudo atual continua.
  const escudoUrl = await escudoEnviado(formData);

  await db.time.update({
    where: { id },
    data: { nome, categoriaId, treinadorId, ...(escudoUrl ? { escudoUrl } : {}) },
  });
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
  revalidatePath(paths.admin.time(session.user.tenantSlug!, id));
}

/** Tira o escudo do time; voltam a aparecer as iniciais. */
export async function removerEscudo(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.time.update({ where: { id }, data: { escudoUrl: null } });
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
  revalidatePath(paths.admin.time(session.user.tenantSlug!, id));
}

export async function deleteTime(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.time.delete({ where: { id } });
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
}

/**
 * Treinador que já tem conta abre o link de cadastro de outra categoria:
 * a categoria fica guardada na conta e ele cria o novo time no painel.
 */
export async function usarLinkCategoria(token: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "TREINADOR") return;
  const db = getTenantPrisma(session.user.tenantId!);
  const categoria = await db.categoria.findFirst({
    where: { conviteTreinadorToken: token, campeonato: { ativo: true } },
    select: { id: true },
  });
  if (!categoria || (await treinadorTemTimeNaCategoria(db, session.user.id, categoria.id))) return;

  await db.user.update({ where: { id: session.user.id }, data: { categoriaConviteId: categoria.id } });
  revalidatePath(paths.treinador.root(session.user.tenantSlug!));
  redirect(paths.treinador.root(session.user.tenantSlug!));
}
