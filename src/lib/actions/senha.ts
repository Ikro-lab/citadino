"use server";

import { randomBytes } from "crypto";
import * as z from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { getTenantBySlug } from "@/lib/tenant";
import { paths } from "@/lib/tenant-path";
import { VALIDADE_LINK_SENHA_HORAS, hashDoToken, usuarioDoLinkSenha } from "@/lib/link-senha";

/**
 * Admin gera o link de nova senha de um treinador do próprio campeonato, para
 * mandar pelo WhatsApp (o app não envia e-mail). Um link novo invalida o
 * anterior; a senha atual continua valendo até o treinador usar o link.
 */
export async function gerarLinkSenha(treinadorId: string): Promise<{ caminho: string; expiraEm: string }> {
  const session = await requireAdmin();
  const tenantId = session.user.tenantId!;
  const treinador = await prisma.user.findFirst({
    where: { id: treinadorId, tenantId, role: "TREINADOR" },
    select: { id: true },
  });
  if (!treinador) throw new Error("Treinador não encontrado neste campeonato.");

  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + VALIDADE_LINK_SENHA_HORAS * 3600e3);
  await prisma.user.update({
    where: { id: treinador.id },
    data: { senhaTokenHash: hashDoToken(token), senhaTokenExpiraEm: expiraEm },
  });
  return { caminho: paths.redefinirSenha(session.user.tenantSlug!, token), expiraEm: expiraEm.toISOString() };
}

const NovaSenhaSchema = z
  .object({
    password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export type NovaSenhaState = { error?: string; fieldErrors?: Record<string, string[]>; ok?: boolean } | undefined;

export async function redefinirSenha(_prev: NovaSenhaState, formData: FormData): Promise<NovaSenhaState> {
  const tenantSlug = String(formData.get("tenantSlug") || "");
  const token = String(formData.get("token") || "");
  const parsed = NovaSenhaSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

  const tenant = await getTenantBySlug(tenantSlug);
  const user = await usuarioDoLinkSenha(tenant.id, token);
  if (!user) return { error: "Este link não vale mais. Peça um novo ao organizador." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(parsed.data.password, 10), senhaTokenHash: null, senhaTokenExpiraEm: null },
  });
  return { ok: true };
}
