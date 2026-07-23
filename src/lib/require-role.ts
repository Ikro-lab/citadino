import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { paths } from "@/lib/tenant-path";

export async function requireSuperAdmin() {
  const session = await auth();
  if (session?.user?.role !== "SUPER_ADMIN") redirect("/super-admin/login");
  return session;
}

/**
 * `tenantSlug` só é necessário em páginas/layouts (para decidir se redireciona
 * pro login do tenant certo quando a sessão é de outro tenant). Server actions
 * chamadas a partir de uma página já protegida podem omitir o argumento — a
 * segurança real da mutação vem de `getTenantPrisma(session.user.tenantId)`,
 * não desse redirect.
 */
export async function requireAdmin(tenantSlug?: string) {
  const session = await auth();
  if (
    session?.user?.role !== "ADMIN" ||
    (tenantSlug !== undefined && session.user.tenantSlug !== tenantSlug)
  ) {
    redirect(tenantSlug ? paths.login(tenantSlug) : "/login");
  }
  if (!session.user.tenantId) {
    // Invariante: ADMIN sempre tem tenantId. Se isso falhar, algo corrompeu os dados.
    throw new Error("Usuário ADMIN sem tenantId associado.");
  }
  return session;
}

export async function requireTreinador(tenantSlug?: string) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "TREINADOR" && session.user.role !== "ADMIN") ||
    (tenantSlug !== undefined && session.user.tenantSlug !== tenantSlug)
  ) {
    redirect(tenantSlug ? paths.login(tenantSlug) : "/login");
  }
  if (!session.user.tenantId) {
    throw new Error("Usuário sem tenantId associado.");
  }
  return session;
}
