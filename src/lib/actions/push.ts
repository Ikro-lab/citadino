"use server";

import { prisma } from "@/lib/prisma";

type SubscriptionJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeUser(
  sub: SubscriptionJSON,
  prefs: { categoriaId?: string | null; timeId?: string | null; lembreteMin?: number }
) {
  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      categoriaId: prefs.categoriaId || null,
      timeId: prefs.timeId || null,
      lembreteMin: prefs.lembreteMin ?? 30,
    },
    create: {
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      categoriaId: prefs.categoriaId || null,
      timeId: prefs.timeId || null,
      lembreteMin: prefs.lembreteMin ?? 30,
    },
  });
  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
  return { success: true };
}
