"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { requireAdmin } from "@/lib/require-role";
import { getOrCreateDeviceId } from "@/lib/device-id";
import { paths } from "@/lib/tenant-path";

export async function createEnquete(formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;

  const categoriaId = String(formData.get("categoriaId") || "");
  const rodada = Number(formData.get("rodada"));
  const pergunta = String(formData.get("pergunta") || "Melhor Jogador da Rodada").trim();
  const atletaIds = formData.getAll("atletaIds").map(String).filter(Boolean);

  if (!categoriaId || !rodada || atletaIds.length < 2) return;

  const tenantId = session.user.tenantId!;
  await db.enquete.create({
    data: {
      tenantId,
      categoriaId,
      rodada,
      pergunta,
      opcoes: { create: atletaIds.map((atletaId) => ({ tenantId, atletaId })) },
    },
  });
  revalidatePath(paths.admin.enquetes(tenantSlug));
  revalidatePath(paths.enquete(tenantSlug));
}

export async function toggleEnqueteAtiva(id: string, ativa: boolean) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  await db.enquete.update({ where: { id }, data: { ativa } });
  revalidatePath(paths.admin.enquetes(tenantSlug));
  revalidatePath(paths.enquete(tenantSlug));
}

export async function deleteEnquete(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  await db.enquete.delete({ where: { id } });
  revalidatePath(paths.admin.enquetes(tenantSlug));
  revalidatePath(paths.enquete(tenantSlug));
}

export type VotarState = { error?: string; success?: boolean } | undefined;

export async function votar(
  enqueteId: string,
  opcaoId: string
): Promise<VotarState> {
  // Rota pública (sem sessão) — o tenant é resolvido a partir do próprio
  // enqueteId (cuid globalmente único), não de um argumento confiável do cliente.
  const enquete = await prisma.enquete.findUnique({
    where: { id: enqueteId },
    include: { tenant: { select: { id: true, slug: true } } },
  });
  if (!enquete || !enquete.ativa) return { error: "Enquete não está mais ativa." };

  const deviceId = await getOrCreateDeviceId();
  const db = getTenantPrisma(enquete.tenant.id);

  try {
    await db.enqueteVoto.create({
      data: { tenantId: enquete.tenant.id, enqueteId, opcaoId, deviceId },
    });
  } catch {
    return { error: "Você já votou nesta enquete." };
  }

  revalidatePath(paths.enquete(enquete.tenant.slug));
  return { success: true };
}
