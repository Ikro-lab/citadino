"use server";

import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { getDeviceIdReadOnly, getOrCreateDeviceId } from "@/lib/device-id";
import { buscarFeedGols, type OrdemFeed } from "@/lib/feed-gols";
import { curtidasExibidas } from "@/lib/curtidas";

/**
 * Curte ou descurte um gol (uma curtida por aparelho). Rota pública: o tenant
 * vem do próprio gol, não do cliente. Devolve o total como aparece no feed.
 */
export async function alternarCurtida(
  eventoId: string
): Promise<{ curtido: boolean; curtidas: number } | { error: string }> {
  const evento = await prisma.eventoPartida.findUnique({
    where: { id: eventoId },
    select: { tipo: true, tenantId: true },
  });
  if (!evento || evento.tipo !== "GOL") return { error: "Gol não encontrado." };

  const deviceId = await getOrCreateDeviceId();
  const db = getTenantPrisma(evento.tenantId);
  const { count } = await db.curtidaGol.deleteMany({ where: { eventoId, deviceId } });
  const curtido = count === 0;
  if (curtido) {
    // Dois toques ao mesmo tempo: o segundo bate no @@unique e a curtida fica.
    await db.curtidaGol.create({ data: { tenantId: evento.tenantId, eventoId, deviceId } }).catch(() => {});
  }
  const total = await db.curtidaGol.count({ where: { eventoId } });
  return { curtido, curtidas: curtidasExibidas(total, curtido) };
}

/** Próximo pedaço do feed de gols (rolagem infinita). */
export async function carregarMaisGols(tenantSlug: string, ordem: OrdemFeed, pular: number) {
  const tenant = await getTenantBySlug(tenantSlug);
  return buscarFeedGols(
    tenant.id,
    ordem === "curtidos" ? "curtidos" : "recentes",
    Math.max(0, Math.floor(pular) || 0),
    await getDeviceIdReadOnly()
  );
}
