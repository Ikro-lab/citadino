"use server";

import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { auth } from "@/auth";
import { saveDocumentoPrivado, saveUpload } from "@/lib/storage";
import { paths } from "@/lib/tenant-path";
import type { Posicao } from "@prisma/client";

async function assertCanManageTime(timeId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  const db = getTenantPrisma(session.user.tenantId!);
  if (session.user.role === "ADMIN") return db;

  const time = await db.time.findUnique({
    where: { id: timeId },
    select: { treinadorId: true },
  });
  if (!time || time.treinadorId !== session.user.id) {
    throw new Error("Você não tem permissão para gerenciar este time.");
  }
  return db;
}

function revalidateTimeViews(tenantSlug: string, timeId: string) {
  revalidatePath(paths.admin.time(tenantSlug, timeId));
  revalidatePath(paths.treinador.root(tenantSlug));
}

export type CreateAtletaState = { error?: string } | undefined;

export async function createAtleta(
  timeId: string,
  _prevState: CreateAtletaState,
  formData: FormData
): Promise<CreateAtletaState> {
  const db = await assertCanManageTime(timeId);
  const session = await auth();
  const tenantSlug = session!.user.tenantSlug!;

  const nome = String(formData.get("nome") || "").trim();
  const numero = Number(formData.get("numero"));
  const posicao = String(formData.get("posicao") || "LINHA") as Posicao;
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const dataNascimentoRaw = String(formData.get("dataNascimento") || "").trim();
  const dataNascimento = dataNascimentoRaw ? new Date(dataNascimentoRaw) : null;
  if (!nome || !numero || Number.isNaN(numero)) {
    return { error: "Preencha o nome e o número corretamente." };
  }

  const foto = formData.get("foto");
  const documento = formData.get("documento");
  const comprovante = formData.get("comprovanteEndereco");
  if (!(foto instanceof File) || foto.size === 0) {
    return { error: "Envie uma foto do atleta." };
  }
  if (!(documento instanceof File) || documento.size === 0) {
    return { error: "Envie a foto do documento de identificação." };
  }
  if (!(comprovante instanceof File) || comprovante.size === 0) {
    return { error: "Envie o comprovante de endereço." };
  }

  let fotoUrl: string;
  let documentoUrl: string;
  let comprovanteEnderecoUrl: string;
  try {
    fotoUrl = await saveUpload(foto, `atletas/${timeId}`);
    documentoUrl = await saveDocumentoPrivado(documento, `atletas/${timeId}`);
    comprovanteEnderecoUrl = await saveDocumentoPrivado(comprovante, `atletas/${timeId}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao enviar arquivos." };
  }

  await db.atleta.create({
    data: {
      tenantId: session!.user.tenantId!,
      nome,
      numero,
      posicao,
      instagram,
      dataNascimento,
      timeId,
      fotoUrl,
      documentoUrl,
      comprovanteEnderecoUrl,
    },
  });
  revalidateTimeViews(tenantSlug, timeId);
}

export type UpdateAtletaState = { error?: string; ok?: boolean } | undefined;

export async function updateAtleta(
  atletaId: string,
  timeId: string,
  _prevState: UpdateAtletaState,
  formData: FormData
): Promise<UpdateAtletaState> {
  const db = await assertCanManageTime(timeId);
  const session = await auth();
  const tenantSlug = session!.user.tenantSlug!;

  const nome = String(formData.get("nome") || "").trim();
  const numero = Number(formData.get("numero"));
  const posicao = String(formData.get("posicao") || "LINHA") as Posicao;
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const dataNascimentoRaw = String(formData.get("dataNascimento") || "").trim();
  const dataNascimento = dataNascimentoRaw ? new Date(dataNascimentoRaw) : null;
  if (!nome || !numero || Number.isNaN(numero)) {
    return { error: "Preencha o nome e o número corretamente." };
  }

  // Foto só muda quando uma nova é enviada; sem arquivo, mantém a atual.
  let fotoUrl: string | undefined;
  const foto = formData.get("foto");
  if (foto instanceof File && foto.size > 0) {
    if (!foto.type.startsWith("image/")) return { error: "A foto precisa ser uma imagem." };
    try {
      fotoUrl = await saveUpload(foto, `atletas/${timeId}`);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Falha ao enviar a foto." };
    }
  }

  // timeId no where: o treinador só edita atletas do próprio time.
  const { count } = await db.atleta.updateMany({
    where: { id: atletaId, timeId },
    data: { nome, numero, posicao, instagram, dataNascimento, ...(fotoUrl && { fotoUrl }) },
  });
  if (count === 0) return { error: "Atleta não encontrado neste time." };

  revalidateTimeViews(tenantSlug, timeId);
  revalidatePath(paths.atleta(tenantSlug, atletaId));
  return { ok: true };
}

export async function deleteAtleta(atletaId: string, timeId: string) {
  const db = await assertCanManageTime(timeId);
  const session = await auth();
  const tenantSlug = session!.user.tenantSlug!;
  await db.atleta.delete({ where: { id: atletaId } });
  revalidateTimeViews(tenantSlug, timeId);
}
