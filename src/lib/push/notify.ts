import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import type { PushSubscription as StoredSubscription } from "@prisma/client";

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

    const partidas = await prisma.partida.findMany({
      where: {
        status: "AGENDADA",
        dataHora: { gte: janelaInicio, lte: janelaFim },
        OR: [
          sub.categoriaId ? { categoriaId: sub.categoriaId } : undefined,
          sub.timeId ? { timeCasaId: sub.timeId } : undefined,
          sub.timeId ? { timeForaId: sub.timeId } : undefined,
        ].filter(Boolean) as object[],
      },
      include: { timeCasa: true, timeFora: true },
    });

    for (const partida of partidas) {
      await sendToSubscription(sub, {
        title: `Em ${minutos} min: ${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
        body: "Não perca o início da partida.",
        url: `/partida/${partida.id}`,
      });
      enviados += 1;
    }
  }

  return { enviados };
}
