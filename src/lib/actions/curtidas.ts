"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { getDeviceIdReadOnly, getOrCreateDeviceId } from "@/lib/device-id";
import { buscarFeedGols, COOKIE_CATEGORIA_GOLS, type OrdemFeed } from "@/lib/feed-gols";
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
export async function carregarMaisGols(
  tenantSlug: string,
  ordem: OrdemFeed,
  categoriaId: string | null,
  pular: number
) {
  const tenant = await getTenantBySlug(tenantSlug);
  return buscarFeedGols(
    tenant.id,
    { ordem: ordem === "curtidos" || ordem === "dia" ? ordem : "recentes", categoriaId },
    Math.max(0, Math.floor(pular) || 0),
    await getDeviceIdReadOnly()
  );
}

/** Guarda no aparelho a categoria escolhida em Recentes (id ou "todas"). */
export async function guardarCategoriaGols(categoria: string) {
  if (!/^[\w-]{1,40}$/.test(categoria)) return;
  (await cookies()).set(COOKIE_CATEGORIA_GOLS, categoria, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
}
