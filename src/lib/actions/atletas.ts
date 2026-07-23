"use server";

import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { auth } from "@/auth";
import { saveUpload } from "@/lib/storage";
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
    documentoUrl = await saveUpload(documento, `atletas/${timeId}`);
    comprovanteEnderecoUrl = await saveUpload(comprovante, `atletas/${timeId}`);
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

export async function updateAtleta(
  atletaId: string,
  timeId: string,
  formData: FormData
) {
  const db = await assertCanManageTime(timeId);
  const session = await auth();
  const tenantSlug = session!.user.tenantSlug!;

  const nome = String(formData.get("nome") || "").trim();
  const numero = Number(formData.get("numero"));
  const posicao = String(formData.get("posicao") || "LINHA") as Posicao;
  const fotoUrl = String(formData.get("fotoUrl") || "").trim() || null;
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const dataNascimentoRaw = String(formData.get("dataNascimento") || "").trim();
  const dataNascimento = dataNascimentoRaw ? new Date(dataNascimentoRaw) : null;
  if (!nome || !numero || Number.isNaN(numero)) return;

  await db.atleta.update({
    where: { id: atletaId },
    data: { nome, numero, posicao, fotoUrl, instagram, dataNascimento },
  });
  revalidateTimeViews(tenantSlug, timeId);
}

export async function deleteAtleta(atletaId: string, timeId: string) {
  const db = await assertCanManageTime(timeId);
  const session = await auth();
  const tenantSlug = session!.user.tenantSlug!;
  await db.atleta.delete({ where: { id: atletaId } });
  revalidateTimeViews(tenantSlug, timeId);
}
