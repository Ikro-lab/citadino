"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";
import { requireAdmin } from "@/lib/require-role";
import { prisma } from "@/lib/prisma";
import { paths } from "@/lib/tenant-path";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { apagarArquivosSemUso, refsDe } from "@/lib/arquivos-atleta";
import { ehRefPrivada, moverArquivo } from "@/lib/storage";
import { ehMenorDeIdade } from "@/lib/privacidade";

const Schema = z.object({
  privacidadeOrgao: z.string().trim().max(200, "Use até 200 caracteres."),
  privacidadeEmail: z.union([z.literal(""), z.string().trim().email("Informe um e-mail válido.")]),
});

export type PrivacidadeState = { ok?: boolean; error?: string } | undefined;

/** Dados do controlador mostrados na política de privacidade pública. */
export async function salvarDadosPrivacidade(
  _prev: PrivacidadeState,
  formData: FormData
): Promise<PrivacidadeState> {
  const session = await requireAdmin();
  const parsed = Schema.safeParse({
    privacidadeOrgao: String(formData.get("privacidadeOrgao") ?? ""),
    privacidadeEmail: String(formData.get("privacidadeEmail") ?? "").trim(),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };

  await prisma.tenant.update({
    where: { id: session.user.tenantId! },
    data: {
      privacidadeOrgao: parsed.data.privacidadeOrgao || null,
      privacidadeEmail: parsed.data.privacidadeEmail || null,
    },
  });
  const t = session.user.tenantSlug!;
  revalidatePath(paths.admin.privacidade(t));
  revalidatePath(paths.privacidade(t));
  return { ok: true };
}

/**
 * Fim da temporada: documento e comprovante só servem para conferir a
 * inscrição. Apaga os de todos os atletas e das inscrições já revisadas
 * (as pendentes ainda precisam deles).
 */
export async function apagarDocumentosTemporada() {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const comDocs = { OR: [{ documentoUrl: { not: null } }, { comprovanteEnderecoUrl: { not: null } }] };
  const selectDocs = { documentoUrl: true, comprovanteEnderecoUrl: true } as const;
  const revisadas = { status: { not: "PENDENTE" as const } };

  const [atletas, inscricoes] = await Promise.all([
    db.atleta.findMany({ where: comDocs, select: selectDocs }),
    db.inscricaoAtleta.findMany({ where: { ...comDocs, ...revisadas }, select: selectDocs }),
  ]);
  const limpar = { documentoUrl: null, comprovanteEnderecoUrl: null };
  await db.$transaction([
    db.atleta.updateMany({ where: comDocs, data: limpar }),
    db.inscricaoAtleta.updateMany({ where: { ...comDocs, ...revisadas }, data: limpar }),
  ]);
  await apagarArquivosSemUso(refsDe([...atletas, ...inscricoes]));

  const t = session.user.tenantSlug!;
  revalidatePath(paths.admin.privacidade(t));
  revalidatePath(paths.admin.inscricoes(t));
  revalidatePath(paths.admin.times(t));
}

/**
 * Cadastros anteriores ao termo não têm autorização de imagem registrada.
 * Para os menores de idade, tira a foto do site (vai para o armazenamento
 * privado) até o responsável autorizar pela edição do atleta.
 */
export async function ocultarFotosMenoresSemAutorizacao() {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const atletas = await db.atleta.findMany({
    where: { imagemAutorizadaEm: null, fotoUrl: { not: null }, dataNascimento: { not: null } },
    select: { id: true, fotoUrl: true, dataNascimento: true },
  });
  for (const a of atletas) {
    if (!a.fotoUrl || ehRefPrivada(a.fotoUrl) || !ehMenorDeIdade(a.dataNascimento!)) continue;
    try {
      const nova = await moverArquivo(a.fotoUrl, "privado");
      await db.$transaction([
        db.atleta.update({ where: { id: a.id }, data: { fotoUrl: nova } }),
        db.inscricaoAtleta.updateMany({ where: { fotoUrl: a.fotoUrl }, data: { fotoUrl: nova } }),
      ]);
    } catch (e) {
      console.warn(`[privacidade] Foto do atleta ${a.id} não foi movida:`, e instanceof Error ? e.message : e);
    }
  }
  const t = session.user.tenantSlug!;
  revalidatePath(paths.admin.privacidade(t));
  revalidatePath(paths.home(t));
}
