"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { auth } from "@/auth";
import { saveDocumentoPrivado, saveFotoAtleta } from "@/lib/storage";
import { apagarArquivosSemUso, refsDe } from "@/lib/arquivos-atleta";
import { paths } from "@/lib/tenant-path";
import { inscricoesEncerradas } from "@/lib/prazo-inscricoes";
import { PRIVACIDADE_VERSAO, ehMenorDeIdade } from "@/lib/privacidade";
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
  // Rota pública (sem sessão) — o tenant é resolvido a partir do próprio
  // conviteToken (cuid globalmente único), não de um argumento confiável do cliente.
  const time = await prisma.time.findUnique({
    where: { conviteToken },
    include: { categoria: { select: { campeonato: { select: { inscricoesAbertas: true, inscricoesEncerramEm: true } } } } },
  });
  if (!time) return { error: "Link de convite inválido." };
  if (inscricoesEncerradas(time.categoria.campeonato)) {
    return { error: "As inscrições deste campeonato estão encerradas. Fale com o seu treinador." };
  }

  const parsed = InscricaoSchema.safeParse({
    nome: formData.get("nome"),
    dataNascimento: formData.get("dataNascimento"),
    instagram: formData.get("instagram") || undefined,
  });
  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const dataNascimento = new Date(parsed.data.dataNascimento);
  if (Number.isNaN(dataNascimento.getTime()) || dataNascimento > new Date()) {
    return { fieldErrors: { dataNascimento: ["Data de nascimento inválida."] } };
  }

  // LGPD: a base legal da inscrição é a execução de política pública (art. 7º, III,
  // e art. 23), inclusive para menores (Enunciado CD/ANPD 1/2023); por isso o
  // formulário pede só a ciência da política. O consentimento fica para a imagem:
  // campo separado, opcional e, para menor, dado pelo responsável (ECA Digital).
  if (formData.get("aceite") !== "on") {
    return { fieldErrors: { aceite: ["Confirme que leu a política de privacidade."] } };
  }
  const menor = ehMenorDeIdade(dataNascimento);
  const autorizaImagem = formData.get("aceiteImagem") === "on";
  const responsavel = String(formData.get("responsavelNome") || "").trim();
  if (menor && autorizaImagem && responsavel.length < 5) {
    return {
      fieldErrors: {
        responsavelNome: ["Para autorizar a imagem de menor, informe o nome do pai, mãe ou responsável legal."],
      },
    };
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
    fotoUrl = await saveFotoAtleta(foto, `inscricoes/${time.id}`, autorizaImagem);
    documentoUrl = await saveDocumentoPrivado(documento, `inscricoes/${time.id}`);
    comprovanteEnderecoUrl = await saveDocumentoPrivado(comprovante, `inscricoes/${time.id}`);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Falha ao enviar arquivos." };
  }

  const db = getTenantPrisma(time.tenantId);
  await db.inscricaoAtleta.create({
    data: {
      tenantId: time.tenantId,
      timeId: time.id,
      nome: parsed.data.nome,
      dataNascimento,
      instagram: parsed.data.instagram || null,
      fotoUrl,
      documentoUrl,
      comprovanteEnderecoUrl,
      aceiteTermoEm: new Date(),
      aceiteVersao: PRIVACIDADE_VERSAO,
      aceiteOrigem: menor ? "RESPONSAVEL" : "ATLETA",
      aceiteResponsavel: menor && responsavel ? responsavel : null,
      imagemAutorizadaEm: autorizaImagem ? new Date() : null,
    },
  });

  return { success: true };
}

async function assertPodeGerenciarTime(timeId: string) {
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

export async function aprovarInscricao(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;

  const inscricao = await db.inscricaoAtleta.findUnique({ where: { id } });
  if (!inscricao || inscricao.status !== "PENDENTE") return;

  await assertPodeGerenciarTime(inscricao.timeId);

  const numero = Number(formData.get("numero"));
  const posicao = String(formData.get("posicao") || "") as Posicao;
  if (!numero || Number.isNaN(numero) || !posicao) return;

  await db.$transaction(async (tx) => {
    const atleta = await tx.atleta.create({
      data: {
        tenantId: session.user.tenantId!,
        nome: inscricao.nome,
        numero,
        posicao,
        dataNascimento: inscricao.dataNascimento,
        instagram: inscricao.instagram,
        fotoUrl: inscricao.fotoUrl,
        documentoUrl: inscricao.documentoUrl,
        comprovanteEnderecoUrl: inscricao.comprovanteEnderecoUrl,
        aceiteTermoEm: inscricao.aceiteTermoEm,
        aceiteVersao: inscricao.aceiteVersao,
        aceiteOrigem: inscricao.aceiteOrigem,
        aceiteResponsavel: inscricao.aceiteResponsavel,
        imagemAutorizadaEm: inscricao.imagemAutorizadaEm,
        timeId: inscricao.timeId,
      },
    });

    await tx.inscricaoAtleta.update({
      where: { id },
      data: { status: "APROVADA", atletaId: atleta.id, revisadoEm: new Date() },
    });
  });

  revalidatePath(paths.treinador.root(tenantSlug));
  revalidatePath(paths.admin.inscricoes(tenantSlug));
}

export async function recusarInscricao(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;

  const inscricao = await db.inscricaoAtleta.findUnique({ where: { id } });
  if (!inscricao || inscricao.status !== "PENDENTE") return;

  await assertPodeGerenciarTime(inscricao.timeId);

  // Recusada, a inscrição não tem mais para que guardar documento e comprovante.
  await db.inscricaoAtleta.update({
    where: { id },
    data: { status: "RECUSADA", revisadoEm: new Date(), documentoUrl: null, comprovanteEnderecoUrl: null },
  });
  await apagarArquivosSemUso(
    refsDe([{ documentoUrl: inscricao.documentoUrl, comprovanteEnderecoUrl: inscricao.comprovanteEnderecoUrl }])
  );

  revalidatePath(paths.treinador.root(tenantSlug));
  revalidatePath(paths.admin.inscricoes(tenantSlug));
}

export async function revogarInscricao(id: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Apenas o administrador pode revogar.");
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;

  const inscricao = await db.inscricaoAtleta.findUnique({ where: { id } });
  if (!inscricao || inscricao.status !== "APROVADA") return;

  await db.$transaction(async (tx) => {
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

  revalidatePath(paths.admin.inscricoes(tenantSlug));
  revalidatePath(paths.admin.times(tenantSlug));
}
