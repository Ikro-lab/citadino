import webpush from "web-push";
import { prisma } from "@/lib/prisma";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { dayRange, formatDatetimeLocalBRT, formatHora, shiftDateStr, todayStr, TIMEZONE } from "@/lib/date-utils";
import { previsoesDeInicio } from "@/lib/atraso";
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
    select: {
      categoriaId: true,
      timeCasaId: true,
      timeForaId: true,
      tenant: { select: { slug: true } },
      categoria: { select: { campeonato: { select: { ativo: true } } } },
    },
  });
  // Campeonato inativo (encerrado ou de teste) não avisa o público.
  if (!partida || !partida.categoria.campeonato.ativo) return;

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

/** Quem segue a categoria, um time dela ou todas as categorias (ex: enquete nova). */
export async function notifyCategoria(tenantId: string, categoriaId: string, payload: PushPayload) {
  if (!vapidPublic || !vapidPrivate) return;
  const db = getTenantPrisma(tenantId);

  const times = await db.time.findMany({ where: { categoriaId }, select: { id: true } });
  const subs = await db.pushSubscription.findMany({
    where: {
      OR: [{ categoriaId }, { timeId: { in: times.map((t) => t.id) } }, { categoriaId: null, timeId: null }],
    },
  });
  await Promise.all(subs.map((sub) => sendToSubscription(sub, payload)));
}

/** Só os admins do tenant que ativaram as notificações logados (avisos da organização). */
export async function notifyAdmins(tenantId: string, payload: PushPayload) {
  if (!vapidPublic || !vapidPrivate) return;
  const db = getTenantPrisma(tenantId);

  const admins = await db.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  const subs = await db.pushSubscription.findMany({ where: { userId: { in: admins.map((a) => a.id) } } });
  await Promise.all(subs.map((sub) => sendToSubscription(sub, payload)));
}

export async function notifyBroadcast(tenantId: string, payload: PushPayload) {
  if (!vapidPublic || !vapidPrivate) return;
  const db = getTenantPrisma(tenantId);

  const subs = await db.pushSubscription.findMany();
  await Promise.all(subs.map((sub) => sendToSubscription(sub, payload)));
}

/**
 * Envia o lembrete "faltam X min" quando o início do jogo (o previsto pelo
 * atraso dos anteriores, ou o marcado) fica a até lembreteMin minutos (padrão
 * 30) de cada inscrito. Como o previsto anda com o relógio, cada inscrito
 * recebe um lembrete só por partida (LembreteEnviado). Precisa rodar a cada
 * minuto — o cron nativo da Vercel (Hobby) só roda 1x/dia, então isso é
 * disparado por um agendador externo (ver README).
 *
 * Roda globalmente (todos os tenants) — cada subscription só enxerga
 * partidas do PRÓPRIO tenant, nunca de outro.
 */
export async function notifyLembretesProximos() {
  if (!vapidPublic || !vapidPrivate) return { enviados: 0 };

  const subs = await prisma.pushSubscription.findMany();
  if (subs.length === 0) return { enviados: 0 };

  const agora = Date.now();

  // Jogos de hoje e de amanhã (o lembrete de um jogo logo depois da meia-noite sai antes dela).
  const hoje = todayStr();
  const doDia = await prisma.partida.findMany({
    where: {
      tenantId: { in: Array.from(new Set(subs.map((s) => s.tenantId))) },
      dataHora: { gte: dayRange(hoje).start, lte: dayRange(shiftDateStr(hoje, 1)).end },
      categoria: { campeonato: { ativo: true } },
    },
    include: {
      timeCasa: { select: { nome: true } },
      timeFora: { select: { nome: true } },
      tenant: { select: { slug: true } },
      lembretes: { select: { subscriptionId: true } },
    },
  });
  // Previsão por dia (cada dia é uma sequência de jogos na quadra).
  const previsoes = new Map<string, Date>();
  const porDia = new Map<string, typeof doDia>();
  for (const p of doDia) {
    const dia = `${p.tenantId}|${formatDatetimeLocalBRT(p.dataHora).slice(0, 10)}`;
    porDia.set(dia, [...(porDia.get(dia) ?? []), p]);
  }
  for (const jogos of porDia.values()) {
    for (const [id, previsto] of previsoesDeInicio(jogos, agora)) previsoes.set(id, previsto);
  }

  let enviados = 0;
  for (const partida of doDia) {
    if (partida.status !== "AGENDADA") continue;
    const inicio = (previsoes.get(partida.id) ?? partida.dataHora).getTime();
    const faltam = Math.round((inicio - agora) / 60_000);
    if (faltam <= 0) continue;
    const jaEnviados = new Set(partida.lembretes.map((l) => l.subscriptionId));

    for (const sub of subs) {
      if (sub.tenantId !== partida.tenantId || jaEnviados.has(sub.id)) continue;
      if (faltam > (sub.lembreteMin ?? 30)) continue;
      // sem categoria e sem time = inscrito em "todas as categorias" do seu tenant.
      if (sub.categoriaId && sub.categoriaId !== partida.categoriaId) continue;
      if (!sub.categoriaId && sub.timeId && sub.timeId !== partida.timeCasaId && sub.timeId !== partida.timeForaId) {
        continue;
      }

      // Grava antes de enviar: com duas execuções ao mesmo tempo, só uma passa.
      const registrado = await prisma.lembreteEnviado
        .create({ data: { subscriptionId: sub.id, partidaId: partida.id } })
        .then(() => true)
        .catch(() => false);
      if (!registrado) continue;

      const atrasado = previsoes.has(partida.id);
      await sendToSubscription(sub, {
        title: `Em ${faltam} min: ${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
        body: atrasado
          ? `Previsão de início às ${formatHora(new Date(inicio))}, pelo atraso dos jogos anteriores.`
          : "Não perca o início da partida.",
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
