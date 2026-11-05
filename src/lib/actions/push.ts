"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

type SubscriptionJSON = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export async function subscribeUser(
  sub: SubscriptionJSON,
  prefs: { categoriaId?: string | null; timeId?: string | null; lembreteMin?: number },
  tenantId: string
) {
  // Admin logado neste tenant: a inscrição recebe também os avisos da organização.
  const user = (await auth())?.user;
  const userId = user?.role === "ADMIN" && user.tenantId === tenantId ? user.id : null;

  await prisma.pushSubscription.upsert({
    where: { endpoint: sub.endpoint },
    update: {
      tenantId,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      categoriaId: prefs.categoriaId || null,
      timeId: prefs.timeId || null,
      lembreteMin: prefs.lembreteMin ?? 30,
      userId,
    },
    create: {
      tenantId,
      endpoint: sub.endpoint,
      p256dh: sub.keys.p256dh,
      auth: sub.keys.auth,
      categoriaId: prefs.categoriaId || null,
      timeId: prefs.timeId || null,
      lembreteMin: prefs.lembreteMin ?? 30,
      userId,
    },
  });
  return { success: true };
}

export async function unsubscribeUser(endpoint: string) {
  await prisma.pushSubscription.delete({ where: { endpoint } }).catch(() => {});
  return { success: true };
}
