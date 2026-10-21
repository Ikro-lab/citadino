"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { apagarArquivosSemUso, refsDe, selectArquivos } from "@/lib/arquivos-atleta";
import { saveLogoUpload } from "@/lib/storage";
import { auth } from "@/auth";

async function escudoEnviado(formData: FormData): Promise<string | null> {
  const arquivo = formData.get("escudo");
  // Como os logos de patrocinador: recorta a margem vazia e grava em PNG,
  // mantendo o fundo transparente.
  return arquivo instanceof File && arquivo.size > 0 ? saveLogoUpload(arquivo, "escudos") : null;
}

export type CriarMeuTimeState = { error?: string } | undefined;

/**
 * Treinador cria o próprio time (nome + escudo) numa categoria. A categoria vem
 * do link de cadastro dela (`conviteTreinador`), quando o treinador já logado
 * abre o link de outra categoria, ou da conta dele, no primeiro acesso.
 * Assim um mesmo treinador pode ter times em várias categorias.
 */
export async function criarMeuTime(_prev: CriarMeuTimeState, formData: FormData): Promise<CriarMeuTimeState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "TREINADOR") return { error: "Entre com sua conta de treinador." };
  const tenantId = session.user.tenantId!;
  const db = getTenantPrisma(tenantId);

  const conviteTreinador = String(formData.get("conviteTreinador") || "");
  const user = await db.user.findUnique({ where: { id: session.user.id }, select: { categoriaConviteId: true } });
  const categoria = conviteTreinador
    ? await db.categoria.findFirst({
        where: { conviteTreinadorToken: conviteTreinador, campeonato: { ativo: true } },
        select: { id: true },
      })
    : user?.categoriaConviteId
      ? await db.categoria.findUnique({ where: { id: user.categoriaConviteId }, select: { id: true } })
      : null;
  if (!categoria) {
    return {
      error: conviteTreinador
        ? "Este link de cadastro não é mais válido. Peça um novo ao organizador."
        : "Abra o link de cadastro da categoria que o organizador te enviou.",
    };
  }

  const jaTem = await db.time.findFirst({ where: { categoriaId: categoria.id, treinadorId: session.user.id }, select: { id: true } });
  if (jaTem) return { error: "Você já tem um time nesta categoria." };

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
  if (user?.categoriaConviteId === categoria.id) {
    await db.user.update({ where: { id: session.user.id }, data: { categoriaConviteId: null } });
  }

  revalidatePath(paths.treinador.root(session.user.tenantSlug!));
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
  if (conviteTreinador) redirect(paths.treinador.root(session.user.tenantSlug!));
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
  // Atletas e inscrições caem em cascata; os arquivos deles saem junto.
  const [atletas, inscricoes] = await Promise.all([
    db.atleta.findMany({ where: { timeId: id }, select: selectArquivos }),
    db.inscricaoAtleta.findMany({ where: { timeId: id }, select: selectArquivos }),
  ]);
  await db.time.delete({ where: { id } });
  await apagarArquivosSemUso(refsDe([...atletas, ...inscricoes]));
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
}
