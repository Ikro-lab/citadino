import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { dayRange, todayStr, TIMEZONE } from "@/lib/date-utils";
import { paths } from "@/lib/tenant-path";
import type { Prisma, PushSubscription as StoredSubscription } from "@prisma/client";

const vapidPublic = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || "mailto:admin@citadino.local";

if (vapidPublic && vapidPrivate) {
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);
}

type PushPayload = {
  title: string;
  body: string;
  url?: string;
};

async function sendToSubscription(sub: StoredSubscription, payload: PushPayload) {
  try {
    await webpush.sendNotification(
      {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      },
      JSON.stringify({ icon: "/icon-192.png", ...payload })
    );
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    if (statusCode === 404 || statusCode === 410) {
      await prisma.pushSubscription.delete({ where: { id: sub.id } }).catch(() => {});
    } else {
      console.error("Falha ao enviar push:", error);
    }
  }
}

export async function notifyPartidaEvento(tenantId: string, partidaId: string, payload: PushPayload) {
  if (!vapidPublic || !vapidPrivate) return;
  const db = getTenantPrisma(tenantId);

  const partida = await db.partida.findUnique({
    where: { id: partidaId },
    select: { categoriaId: true, timeCasaId: true, timeForaId: true, tenant: { select: { slug: true } } },
  });
  if (!partida) return;

  const subs = await db.pushSubscription.findMany({
    where: {
      OR: [
        { categoriaId: partida.categoriaId },
        { timeId: partida.timeCasaId },
        { timeId: partida.timeForaId },
        { categoriaId: null, timeId: null },
      ],
    },
  });

  await Promise.all(
    subs.map((sub) =>
      sendToSubscription(sub, { ...payload, url: paths.partida(partida.tenant.slug, partidaId) })
    )
  );
}

export async function notifyBroadcast(tenantId: string, payload: PushPayload) {
  if (!vapidPublic || !vapidPrivate) return;
  const db = getTenantPrisma(tenantId);

  const subs = await db.pushSubscription.findMany();
  await Promise.all(subs.map((sub) => sendToSubscription(sub, payload)));
}

/**
 * Envia o lembrete "faltam X min" para cada inscrito cuja preferência
 * (lembreteMin, padrão 30) caia dentro da janela atual. Precisa rodar a cada
 * minuto para não perder partidas — o cron nativo da Vercel (Hobby) só roda
 * 1x/dia, então isso é disparado por um agendador externo (ver README).
 *
 * Roda globalmente (todos os tenants) — cada subscription só enxerga
 * partidas do PRÓPRIO tenant (where.tenantId), nunca de outro.
 */
export async function notifyLembretesProximos() {
  if (!vapidPublic || !vapidPrivate) return { enviados: 0 };

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return { enviados: 0 };

  const now = new Date();
  let enviados = 0;

  for (const sub of subs) {
    const minutos = sub.lembreteMin ?? 30;
    const janelaInicio = new Date(now.getTime() + (minutos - 1) * 60_000);
    const janelaFim = new Date(now.getTime() + (minutos + 1) * 60_000);

    const where: Prisma.PartidaWhereInput = {
      tenantId: sub.tenantId,
      status: "AGENDADA",
      dataHora: { gte: janelaInicio, lte: janelaFim },
    };

    if (sub.categoriaId) {
      where.categoriaId = sub.categoriaId;
    } else if (sub.timeId) {
      where.OR = [{ timeCasaId: sub.timeId }, { timeForaId: sub.timeId }];
    }
    // sem categoria e sem time = inscrito em "todas as categorias" DO SEU TENANT.

    const partidas = await prisma.partida.findMany({
      where,
      include: { timeCasa: true, timeFora: true, tenant: { select: { slug: true } } },
    });

    for (const partida of partidas) {
      await sendToSubscription(sub, {
        title: `Em ${minutos} min: ${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
        body: "Não perca o início da partida.",
        url: paths.partida(partida.tenant.slug, partida.id),
      });
      enviados += 1;
    }
  }

  return { enviados };
}

/**
 * Envia um resumo diário (1x/dia, disparado pelo cron nativo da Vercel) com
 * os jogos de hoje para cada inscrito, filtrado pela preferência de
 * categoria/time. Roda globalmente — cada subscription só enxerga partidas
 * do próprio tenant (where.tenantId), nunca de outro.
 */
export async function notifyResumoDiario() {
  if (!vapidPublic || !vapidPrivate) return { enviados: 0 };

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return { enviados: 0 };

  const { start: inicioDia, end: fimDia } = dayRange(todayStr());

  let enviados = 0;

  for (const sub of subs) {
    const where: Prisma.PartidaWhereInput = {
      tenantId: sub.tenantId,
      dataHora: { gte: inicioDia, lte: fimDia },
      status: { in: ["AGENDADA", "AO_VIVO"] },
    };

    if (sub.categoriaId) {
      where.categoriaId = sub.categoriaId;
    } else if (sub.timeId) {
      where.OR = [{ timeCasaId: sub.timeId }, { timeForaId: sub.timeId }];
    }
    // sem categoria e sem time = inscrito em "todas as categorias" DO SEU TENANT:
    // recebe o resumo completo do dia (só do seu tenant), sem filtro adicional.

    const partidas = await prisma.partida.findMany({
      where,
      orderBy: { dataHora: "asc" },
      include: { timeCasa: true, timeFora: true, tenant: { select: { slug: true } } },
    });

    if (partidas.length === 0) continue;

    const primeira = partidas[0];
    const title =
      partidas.length === 1
        ? `Hoje tem jogo: ${primeira.timeCasa.nome} x ${primeira.timeFora.nome}`
        : `Hoje tem ${partidas.length} jogos`;
    const body = partidas
      .map(
        (p) =>
          `${p.timeCasa.nome} x ${p.timeFora.nome} às ${p.dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: TIMEZONE })}`
      )
      .join(" · ");

    await sendToSubscription(sub, {
      title,
      body,
      url: partidas.length === 1 ? paths.partida(primeira.tenant.slug, primeira.id) : paths.home(primeira.tenant.slug),
    });
    enviados += 1;
  }

  return { enviados };
}
