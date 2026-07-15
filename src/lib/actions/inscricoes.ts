"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { saveUpload } from "@/lib/storage";
import type { Posicao } from "@prisma/client";

const InscricaoSchema = z.object({
  nome: z.string().trim().min(2, "Informe o nome completo."),
  dataNascimento: z.string().min(1, "Informe a data de nascimento."),
  instagram: z.string().trim().optional(),
});

export type InscricaoState =
  | { error?: string; success?: boolean; fieldErrors?: Record<string, string[]> }
  | undefined;

export async function criarInscricao(
  conviteToken: string,
  _prevState: InscricaoState,
  formData: FormData
): Promise<InscricaoState> {
  const time = await prisma.time.findUnique({ where: { conviteToken } });
  if (!time) return { error: "Link de convite inválido." };

  const parsed = InscricaoSchema.safeParse({
    nome: formData.get("nome"),
    dataNascimento: formData.get("dataNascimento"),
    instagram: formData.get("instagram") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const documento = formData.get("documento");
  const comprovante = formData.get("comprovanteEndereco");
  if (!(documento instanceof File) || documento.size === 0) {
    return { error: "Envie a foto do documento de identificação." };
  }
  if (!(comprovante instanceof File) || comprovante.size === 0) {
    return { error: "Envie o comprovante de endereço." };
  }

  let documentoUrl: string;
  let comprovanteEnderecoUrl: string;
  try {
    documentoUrl = await saveUpload(documento, `inscricoes/${time.id}`);
    comprovanteEnderecoUrl = await saveUpload(comprovante, `inscricoes/${time.id}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao enviar arquivos." };
  }

  await prisma.inscricaoAtleta.create({
    data: {
      timeId: time.id,
      nome: parsed.data.nome,
      dataNascimento: new Date(parsed.data.dataNascimento),
      instagram: parsed.data.instagram || null,
      documentoUrl,
      comprovanteEnderecoUrl,
    },
  });

  return { success: true };
}

async function assertPodeGerenciarTime(timeId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  if (session.user.role === "ADMIN") return;

  const time = await prisma.time.findUnique({
    where: { id: timeId },
    select: { treinadorId: true },
  });
  if (!time || time.treinadorId !== session.user.id) {
    throw new Error("Você não tem permissão para gerenciar este time.");
  }
}

export async function aprovarInscricao(id: string, formData: FormData) {
  const inscricao = await prisma.inscricaoAtleta.findUnique({ where: { id } });
  if (!inscricao || inscricao.status !== "PENDENTE") return;

  await assertPodeGerenciarTime(inscricao.timeId);

  const numero = Number(formData.get("numero"));
  const posicao = String(formData.get("posicao") || "") as Posicao;
  if (!numero || Number.isNaN(numero) || !posicao) return;

  await prisma.$transaction(async (tx) => {
    const atleta = await tx.atleta.create({
      data: {
        nome: inscricao.nome,
        numero,
        posicao,
        dataNascimento: inscricao.dataNascimento,
        instagram: inscricao.instagram,
        timeId: inscricao.timeId,
      },
    });

    await tx.inscricaoAtleta.update({
      where: { id },
      data: { status: "APROVADA", atletaId: atleta.id, revisadoEm: new Date() },
    });
  });

  revalidatePath("/treinador");
  revalidatePath("/admin/inscricoes");
}

export async function recusarInscricao(id: string) {
  const inscricao = await prisma.inscricaoAtleta.findUnique({ where: { id } });
  if (!inscricao || inscricao.status !== "PENDENTE") return;

  await assertPodeGerenciarTime(inscricao.timeId);

  await prisma.inscricaoAtleta.update({
    where: { id },
    data: { status: "RECUSADA", revisadoEm: new Date() },
  });

  revalidatePath("/treinador");
  revalidatePath("/admin/inscricoes");
}

export async function revogarInscricao(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Apenas o administrador pode revogar.");

  const inscricao = await prisma.inscricaoAtleta.findUnique({ where: { id } });
  if (!inscricao || inscricao.status !== "APROVADA") return;

  await prisma.$transaction(async (tx) => {
    if (inscricao.atletaId) {
      try {
        await tx.atleta.delete({ where: { id: inscricao.atletaId } });
      } catch {
        // atleta já tem eventos de partida registrados — mantém o cadastro,
        // mas volta a inscrição para recusada para fins de auditoria.
      }
    }
    await tx.inscricaoAtleta.update({
      where: { id },
      data: { status: "RECUSADA", revisadoEm: new Date() },
    });
  });

  revalidatePath("/admin/inscricoes");
  revalidatePath("/admin/times");
}
