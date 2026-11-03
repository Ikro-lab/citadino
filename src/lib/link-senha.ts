import "server-only";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";

/** Validade do link de nova senha que o admin gera para o treinador. */
export const VALIDADE_LINK_SENHA_HORAS = 48;

/** No banco fica só o SHA-256 do token; o token puro vai apenas no link. */
export const hashDoToken = (token: string) => createHash("sha256").update(token).digest("hex");

/** Dono do link de nova senha, se o link ainda vale neste tenant. */
export async function usuarioDoLinkSenha(tenantId: string, token: string) {
  const user = await prisma.user.findUnique({
    where: { senhaTokenHash: hashDoToken(token) },
    select: { id: true, name: true, email: true, tenantId: true, senhaTokenExpiraEm: true },
  });
  if (!user || user.tenantId !== tenantId || !user.senhaTokenExpiraEm || user.senhaTokenExpiraEm < new Date()) return null;
  return { id: user.id, name: user.name, email: user.email };
}
