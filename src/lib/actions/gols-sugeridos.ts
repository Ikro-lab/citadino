"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { requireAdmin } from "@/lib/require-role";
import { paths } from "@/lib/tenant-path";
import { notifyPartidaEvento } from "@/lib/push/notify";
import { extrairYoutubeId, youtubeUrlNoSegundo } from "@/lib/youtube";
import { minutoDeJogo } from "@/lib/escalacao";
import { ATRASO_DETECCAO_MS } from "@/lib/gols-sugeridos";

function revalidarGol(tenantSlug: string, partidaId: string) {
  revalidatePath(paths.admin.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.partida(tenantSlug, partidaId));
  revalidatePath(paths.home(tenantSlug));
  revalidatePath(paths.artilharia(tenantSlug));
  revalidatePath(paths.admin.golsSugeridos(tenantSlug));
}

async function atletaDoTime(db: ReturnType<typeof getTenantPrisma>, formData: FormData, timeId: string) {
  const atletaId = String(formData.get("atletaId") || "") || null;
  if (atletaId) {
    const atleta = await db.atleta.findUnique({ where: { id: atletaId }, select: { timeId: true } });
    if (atleta?.timeId !== timeId) throw new Error("Escolha um atleta do time do gol.");
  }
  return atletaId;
}

/** Aprova o gol pendente (placar da live diferente do site): vira lance na súmula, com o autor escolhido (opcional). */
export async function aprovarGolSugerido(id: string, formData: FormData) {
  const session = await requireAdmin();
  const tenantId = session.user.tenantId!;
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(tenantId);

  const sugestao = await db.golSugerido.findUniqueOrThrow({ where: { id } });
  const atletaId = await atletaDoTime(db, formData, sugestao.timeId);

  // Só um aprova: dois toques (ou dois admins) não lançam o gol em dobro.
  const { count } = await db.golSugerido.updateMany({
    where: { id, status: "PENDENTE" },
    data: { status: "APROVADO", resolvidoEm: new Date() },
  });
  if (count === 0) redirect(paths.admin.golsSugeridos(tenantSlug));

  const atual = await db.partida.findUniqueOrThrow({ where: { id: sugestao.partidaId } });
  const videoId = extrairYoutubeId(atual.linkTransmissaoUrl);
  const minuto = minutoDeJogo(atual, sugestao.createdAt.getTime() - ATRASO_DETECCAO_MS);

  const partida = await db.$transaction(async (tx) => {
    const evento = await tx.eventoPartida.create({
      data: {
        tenantId,
        partidaId: sugestao.partidaId,
        tipo: "GOL",
        timeId: sugestao.timeId,
        atletaId,
        minuto,
        lancadoPorId: session.user.id,
        videoUrl: videoId ? youtubeUrlNoSegundo(videoId, sugestao.videoSegundo) : null,
      },
    });
    await tx.golSugerido.update({ where: { id }, data: { eventoId: evento.id } });
    return tx.partida.update({
      where: { id: sugestao.partidaId },
      data: sugestao.timeId === atual.timeCasaId ? { placarCasa: { increment: 1 } } : { placarFora: { increment: 1 } },
      include: { timeCasa: true, timeFora: true },
    });
  });

  revalidarGol(tenantSlug, partida.id);

  const timeNome = sugestao.timeId === partida.timeCasaId ? partida.timeCasa.nome : partida.timeFora.nome;
  await notifyPartidaEvento(tenantId, partida.id, {
    title: `Gol de ${timeNome}!`,
    body: `${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`,
  });

  redirect(paths.admin.golsSugeridos(tenantSlug));
}

/**
 * Gol já na súmula com o clipe da live esperando: aprovar põe o clipe no lance
 * (e o autor, se escolhido); "sem clipe" deixa o lance sem vídeo. Nos dois, o
 * admin assume o lance: se o placar da live voltar, o gol não sai sozinho.
 */
async function resolverClipe(id: string, formData: FormData, comClipe: boolean) {
  const session = await requireAdmin();
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(session.user.tenantId!);

  const sugestao = await db.golSugerido.findUniqueOrThrow({
    where: { id },
    include: { partida: { select: { linkTransmissaoUrl: true } } },
  });
  const atletaId = await atletaDoTime(db, formData, sugestao.timeId);

  const { count } = await db.golSugerido.updateMany({
    where: { id, status: "CLIPE", eventoId: { not: null } },
    data: { status: comClipe ? "APROVADO" : "SEM_CLIPE", resolvidoEm: new Date() },
  });
  if (count === 1) {
    const videoId = extrairYoutubeId(sugestao.partida.linkTransmissaoUrl);
    await db.eventoPartida.update({
      where: { id: sugestao.eventoId! },
      data: {
        ...(atletaId ? { atletaId } : {}),
        lancadoPorId: session.user.id,
        videoUrl: comClipe && videoId ? youtubeUrlNoSegundo(videoId, sugestao.videoSegundo) : null,
      },
    });
    revalidarGol(tenantSlug, sugestao.partidaId);
  }
  redirect(paths.admin.golsSugeridos(tenantSlug));
}

export async function aprovarClipeGol(id: string, formData: FormData) {
  await resolverClipe(id, formData, true);
}

export async function golSemClipe(id: string, formData: FormData) {
  await resolverClipe(id, formData, false);
}

/**
 * Placar da transmissão errado (ou gol anulado). Pendente: some sem lançar
 * nada. Já lançado pela transmissão: o gol sai da súmula e do placar.
 */
export async function descartarGolSugerido(id: string) {
  const session = await requireAdmin();
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(session.user.tenantId!);

  const sugestao = await db.golSugerido.findUniqueOrThrow({ where: { id } });
  const { count } = await db.golSugerido.updateMany({
    where: { id, status: { in: ["PENDENTE", "CLIPE"] } },
    data: { status: "DESCARTADO", eventoId: null, resolvidoEm: new Date() },
  });
  if (count === 1 && sugestao.status === "CLIPE" && sugestao.eventoId) {
    await db.$transaction(async (tx) => {
      const evento = await tx.eventoPartida.delete({ where: { id: sugestao.eventoId! } });
      const partida = await tx.partida.findUniqueOrThrow({ where: { id: sugestao.partidaId } });
      await tx.partida.update({
        where: { id: partida.id },
        data: evento.timeId === partida.timeCasaId ? { placarCasa: { decrement: 1 } } : { placarFora: { decrement: 1 } },
      });
    });
  }
  revalidarGol(tenantSlug, sugestao.partidaId);
  redirect(paths.admin.golsSugeridos(tenantSlug));
}

/**
 * Corte do clipe atrasado ou adiantado: anda alguns segundos. Se o clipe já foi
 * aprovado, o lance da súmula acompanha.
 */
export async function ajustarGolSugerido(id: string, delta: number) {
  const session = await requireAdmin();
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(session.user.tenantId!);

  const sugestao = await db.golSugerido.findUniqueOrThrow({
    where: { id },
    include: { partida: { select: { linkTransmissaoUrl: true } } },
  });
  const videoSegundo = Math.max(0, sugestao.videoSegundo + delta);
  await db.golSugerido.update({ where: { id }, data: { videoSegundo } });

  const videoId = extrairYoutubeId(sugestao.partida.linkTransmissaoUrl);
  const clipeNoLance = sugestao.status === "APROVADO" || sugestao.status === "LANCADO";
  if (sugestao.eventoId && videoId && clipeNoLance) {
    await db.eventoPartida.update({
      where: { id: sugestao.eventoId },
      data: { videoUrl: youtubeUrlNoSegundo(videoId, videoSegundo) },
    });
    revalidatePath(paths.partida(tenantSlug, sugestao.partidaId));
    revalidatePath(paths.admin.partidaSumula(tenantSlug, sugestao.partidaId));
  }
  revalidatePath(paths.admin.golsSugeridos(tenantSlug));
  revalidatePath(paths.admin.golSugerido(tenantSlug, id));
}
