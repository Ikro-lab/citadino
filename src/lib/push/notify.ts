import webpush from "web-push";
import { prisma } from "@/lib/prisma";
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

export async function notifyPartidaEvento(partidaId: string, payload: PushPayload) {
  if (!vapidPublic || !vapidPrivate) return;

  const partida = await prisma.partida.findUnique({
    where: { id: partidaId },
    select: { categoriaId: true, timeCasaId: true, timeForaId: true },
  });
  if (!partida) return;

  const subs = await prisma.pushSubscription.findMany({
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
      sendToSubscription(sub, { ...payload, url: `/partida/${partidaId}` })
    )
  );
}

export async function notifyBroadcast(payload: PushPayload) {
  if (!vapidPublic || !vapidPrivate) return;

  const subs = await prisma.pushSubscription.findMany();
  await Promise.all(subs.map((sub) => sendToSubscription(sub, payload)));
}

/**
 * Envia um resumo diário (1x/dia, disparado por cron externo) com os jogos de
 * hoje para cada inscrito, filtrado pela preferência de categoria/time.
 * Substitui o antigo lembrete "X min antes", que exigiria um cron de minuto
 * em minuto — indisponível no plano Hobby da Vercel (cron só 1x/dia).
 */
export async function notifyResumoDiario() {
  if (!vapidPublic || !vapidPrivate) return { enviados: 0 };

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return { enviados: 0 };

  const inicioDia = new Date();
  inicioDia.setHours(0, 0, 0, 0);
  const fimDia = new Date();
  fimDia.setHours(23, 59, 59, 999);

  let enviados = 0;

  for (const sub of subs) {
    const where: Prisma.PartidaWhereInput = {
      dataHora: { gte: inicioDia, lte: fimDia },
      status: { in: ["AGENDADA", "AO_VIVO"] },
    };

    if (sub.categoriaId) {
      where.categoriaId = sub.categoriaId;
    } else if (sub.timeId) {
      where.OR = [{ timeCasaId: sub.timeId }, { timeForaId: sub.timeId }];
    }
    // sem categoria e sem time = inscrito em "todas as categorias": recebe o
    // resumo completo do dia, sem filtro adicional.

    const partidas = await prisma.partida.findMany({
      where,
      orderBy: { dataHora: "asc" },
      include: { timeCasa: true, timeFora: true },
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
          `${p.timeCasa.nome} x ${p.timeFora.nome} às ${p.dataHora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
      )
      .join(" · ");

    await sendToSubscription(sub, {
      title,
      body,
      url: partidas.length === 1 ? `/partida/${primeira.id}` : "/",
    });
    enviados += 1;
  }

  return { enviados };
}
