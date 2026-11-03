import "server-only";
import { prisma } from "@/lib/prisma";

/** E-mail como fica gravado: sem espaços nas pontas e em minúsculas. */
export const normalizarEmail = (email: string) => email.trim().toLowerCase();

/**
 * Conta do campeonato pelo e-mail, sem diferença de maiúsculas. Contas de
 * antes da normalização (scripts/normalizar-emails.ts) podem estar gravadas
 * com maiúsculas: então procura também exatamente como foi digitado.
 */
export async function usuarioPorEmail(tenantId: string, email: string) {
  const normal = normalizarEmail(email);
  const achado = await prisma.user.findUnique({ where: { tenantId_email: { tenantId, email: normal } } });
  if (achado || email.trim() === normal) return achado;
  return prisma.user.findUnique({ where: { tenantId_email: { tenantId, email: email.trim() } } });
}
