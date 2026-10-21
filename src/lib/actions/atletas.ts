"use server";

import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { auth } from "@/auth";
import { apagarArquivos, ehRefPrivada, moverArquivo, saveDocumentoPrivado, saveFotoAtleta } from "@/lib/storage";
import { paths } from "@/lib/tenant-path";
import { ehMenorDeIdade } from "@/lib/privacidade";
import { apagarArquivosSemUso, refsDe, selectArquivos } from "@/lib/arquivos-atleta";
import { MENSAGEM_NUMERO_REPETIDO, ehNumeroRepetido, numeroOcupado } from "@/lib/numero-camisa";
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

/**
 * Autorização de imagem marcada por quem cadastra (admin/treinador), com base
 * na autorização por escrito do atleta ou do responsável legal, se menor.
 */
function lerAutorizacaoImagem(formData: FormData, dataNascimento: Date | null) {
  const autoriza = formData.get("aceiteImagem") === "on";
  const responsavel = String(formData.get("responsavelNome") || "").trim() || null;
  if (autoriza && dataNascimento && ehMenorDeIdade(dataNascimento) && (!responsavel || responsavel.length < 5)) {
    return { error: "Atleta menor de idade: informe o responsável legal que autorizou o uso da imagem." } as const;
  }
  return { autoriza, responsavel };
}

function revalidateTimeViews(tenantSlug: string, timeId: string) {
  revalidatePath(paths.admin.time(tenantSlug, timeId));
  revalidatePath(paths.treinador.root(tenantSlug));
}

export type CreateAtletaState = { error?: string; ok?: boolean } | undefined;

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
  if (dataNascimento && Number.isNaN(dataNascimento.getTime())) {
    return { error: "Data de nascimento inválida." };
  }

  const imagem = lerAutorizacaoImagem(formData, dataNascimento);
  if ("error" in imagem) return { error: imagem.error };

  // Antes do upload, para não subir arquivos de um cadastro que vai ser recusado.
  const ocupado = await numeroOcupado(db, timeId, numero);
  if (ocupado) return { error: ocupado };

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
    fotoUrl = await saveFotoAtleta(foto, `atletas/${timeId}`, imagem.autoriza);
    documentoUrl = await saveDocumentoPrivado(documento, `atletas/${timeId}`);
    comprovanteEnderecoUrl = await saveDocumentoPrivado(comprovante, `atletas/${timeId}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao enviar arquivos." };
  }

  try {
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
        aceiteOrigem: "DECLARADO",
        aceiteResponsavel: imagem.responsavel,
        imagemAutorizadaEm: imagem.autoriza ? new Date() : null,
      },
    });
  } catch (e) {
    await apagarArquivos([fotoUrl, documentoUrl, comprovanteEnderecoUrl]);
    if (ehNumeroRepetido(e)) return { error: MENSAGEM_NUMERO_REPETIDO };
    throw e;
  }
  revalidateTimeViews(tenantSlug, timeId);
  return { ok: true };
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

  if (dataNascimento && Number.isNaN(dataNascimento.getTime())) {
    return { error: "Data de nascimento inválida." };
  }
  const imagem = lerAutorizacaoImagem(formData, dataNascimento);
  if ("error" in imagem) return { error: imagem.error };

  // timeId no where: o treinador só edita atletas do próprio time.
  const atual = await db.atleta.findFirst({
    where: { id: atletaId, timeId },
    select: { fotoUrl: true, imagemAutorizadaEm: true },
  });
  if (!atual) return { error: "Atleta não encontrado neste time." };
  const ocupado = await numeroOcupado(db, timeId, numero, atletaId);
  if (ocupado) return { error: ocupado };

  // Foto: uma nova substitui a atual; sem arquivo novo, a atual só muda de
  // lugar se a autorização de imagem foi dada ou revogada.
  let fotoUrl = atual.fotoUrl;
  const antiga = atual.fotoUrl;
  const foto = formData.get("foto");
  try {
    if (foto instanceof File && foto.size > 0) {
      if (!foto.type.startsWith("image/")) return { error: "A foto precisa ser uma imagem." };
      fotoUrl = await saveFotoAtleta(foto, `atletas/${timeId}`, imagem.autoriza);
    } else if (fotoUrl) {
      fotoUrl = await moverArquivo(fotoUrl, imagem.autoriza ? "publico" : "privado");
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao salvar a foto." };
  }

  const autorizadaAntes = !!antiga && !ehRefPrivada(antiga);
  try {
    await db.atleta.update({
      where: { id: atletaId },
      data: {
        nome,
        numero,
        posicao,
        instagram,
        dataNascimento,
        fotoUrl,
        aceiteResponsavel: imagem.responsavel,
        imagemAutorizadaEm: imagem.autoriza ? (autorizadaAntes ? atual.imagemAutorizadaEm ?? new Date() : new Date()) : null,
      },
    });
  } catch (e) {
    if (ehNumeroRepetido(e)) return { error: MENSAGEM_NUMERO_REPETIDO };
    throw e;
  }

  // Foto que só mudou de lugar: a inscrição de origem aponta para o mesmo arquivo.
  const novaFoto = foto instanceof File && foto.size > 0;
  if (antiga && fotoUrl && antiga !== fotoUrl && !novaFoto) {
    await db.inscricaoAtleta.updateMany({ where: { fotoUrl: antiga }, data: { fotoUrl } });
  }

  // A foto trocada por um arquivo novo sai do armazenamento, se a inscrição
  // de origem não a usa mais. (Quando só mudou de lugar, moverArquivo já apagou.)
  if (antiga && antiga !== fotoUrl && novaFoto) {
    await apagarArquivosSemUso(new Set([antiga]));
  }

  revalidateTimeViews(tenantSlug, timeId);
  revalidatePath(paths.atleta(tenantSlug, atletaId));
  return { ok: true };
}

export async function deleteAtleta(atletaId: string, timeId: string) {
  const db = await assertCanManageTime(timeId);
  const session = await auth();
  const tenantSlug = session!.user.tenantSlug!;
  const atleta = await db.atleta.findFirst({ where: { id: atletaId, timeId }, select: selectArquivos });
  if (!atleta) return;

  // Apagar o atleta apaga também a inscrição de origem e os arquivos dele
  // (foto, documento, comprovante), que a inscrição compartilha.
  const refs = await db.$transaction(async (tx) => {
    const inscricoes = await tx.inscricaoAtleta.findMany({ where: { atletaId }, select: selectArquivos });
    await tx.inscricaoAtleta.deleteMany({ where: { atletaId } });
    await tx.atleta.delete({ where: { id: atletaId } });
    return refsDe([atleta, ...inscricoes]);
  });
  await apagarArquivosSemUso(refs);
  revalidateTimeViews(tenantSlug, timeId);
}
