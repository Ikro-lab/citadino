import "server-only";
import { cache } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const getTenantBySlug = cache(async (slug: string) => {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant || !tenant.ativo) notFound();
  return tenant;
});

/**
 * Igual a `getTenantBySlug`, mas retorna `null` em vez de chamar `notFound()`
 * — `notFound()` só funciona dentro do pipeline de renderização de páginas;
 * em Route Handlers (`app/api/**`) ele resultaria em erro 500 não tratado.
 */
export async function getTenantBySlugOrNull(slug: string) {
  const tenant = await prisma.tenant.findUnique({ where: { slug } });
  if (!tenant || !tenant.ativo) return null;
  return tenant;
}

const RESERVED_TENANT_SLUGS = new Set([
  "super-admin",
  "api",
  "login",
  "_next",
  "favicon.ico",
  "manifest.json",
  "icon-192.png",
  "icon-512.png",
]);

export function isValidTenantSlug(slug: string) {
  return /^[a-z0-9-]+$/.test(slug) && !RESERVED_TENANT_SLUGS.has(slug);
}
