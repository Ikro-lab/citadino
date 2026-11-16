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

/** Aprova o gol visto na live: vira lance na súmula, com o autor escolhido (opcional). */
export async function aprovarGolSugerido(id: string, formData: FormData) {
  const session = await requireAdmin();
  const tenantId = session.user.tenantId!;
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(tenantId);
  const atletaId = String(formData.get("atletaId") || "") || null;

  const sugestao = await db.golSugerido.findUniqueOrThrow({ where: { id } });
  if (atletaId) {
    const atleta = await db.atleta.findUnique({ where: { id: atletaId }, select: { timeId: true } });
    if (atleta?.timeId !== sugestao.timeId) throw new Error("Escolha um atleta do time do gol.");
  }

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

  revalidatePath(paths.admin.partidaSumula(tenantSlug, partida.id));
  revalidatePath(paths.partida(tenantSlug, partida.id));
  revalidatePath(paths.home(tenantSlug));
  revalidatePath(paths.artilharia(tenantSlug));
  revalidatePath(paths.admin.golsSugeridos(tenantSlug));

  const timeNome = sugestao.timeId === partida.timeCasaId ? partida.timeCasa.nome : partida.timeFora.nome;
  await notifyPartidaEvento(tenantId, partida.id, {
    title: `Gol de ${timeNome}!`,
    body: `${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`,
  });

  redirect(paths.admin.golsSugeridos(tenantSlug));
}

/** Placar da transmissão errado (ou gol anulado): o pendente some sem lançar nada. */
export async function descartarGolSugerido(id: string) {
  const session = await requireAdmin();
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(session.user.tenantId!);

  const sugestao = await db.golSugerido.findUniqueOrThrow({ where: { id } });
  await db.golSugerido.updateMany({
    where: { id, status: "PENDENTE" },
    data: { status: "DESCARTADO", resolvidoEm: new Date() },
  });
  revalidatePath(paths.admin.partidaSumula(tenantSlug, sugestao.partidaId));
  redirect(paths.admin.golsSugeridos(tenantSlug));
}

/**
 * Corte do clipe atrasado ou adiantado: anda alguns segundos. Se o gol já foi
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
  if (sugestao.eventoId && videoId) {
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

function revalidarGolResolvido(tenantSlug: string, partidaId: string) {
  revalidatePath(paths.admin.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.partida(tenantSlug, partidaId));
  revalidatePath(paths.artilharia(tenantSlug));
  revalidatePath(paths.home(tenantSlug));
  revalidatePath(paths.admin.golsSugeridos(tenantSlug));
}

/** Gol que o monitor lançou sozinho: escolhe quem fez (ou deixa sem autor) e sai da fila. */
export async function definirAutorGolAutomatico(id: string, formData: FormData) {
  const session = await requireAdmin();
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(session.user.tenantId!);
  const atletaId = String(formData.get("atletaId") || "") || null;

  const sugestao = await db.golSugerido.findUniqueOrThrow({ where: { id } });
  if (!sugestao.eventoId) throw new Error("Esse gol não está na súmula.");
  if (atletaId) {
    const atleta = await db.atleta.findUnique({ where: { id: atletaId }, select: { timeId: true } });
    if (atleta?.timeId !== sugestao.timeId) throw new Error("Escolha um atleta do time do gol.");
  }

  const { count } = await db.golSugerido.updateMany({
    where: { id, status: "AUTOMATICO" },
    data: { status: "APROVADO", resolvidoEm: new Date() },
  });
  if (count === 1) {
    await db.eventoPartida.update({ where: { id: sugestao.eventoId }, data: { atletaId, lancadoPorId: session.user.id } });
  }

  revalidarGolResolvido(tenantSlug, sugestao.partidaId);
  redirect(paths.admin.golsSugeridos(tenantSlug));
}

/**
 * Gol que o monitor lançou sozinho, mas não foi gol (placar da live errado ou
 * gol anulado): sai da súmula e o placar volta.
 */
export async function anularGolAutomatico(id: string) {
  const session = await requireAdmin();
  const tenantSlug = session.user.tenantSlug!;
  const db = getTenantPrisma(session.user.tenantId!);

  const sugestao = await db.golSugerido.findUniqueOrThrow({ where: { id } });
  const { count } = await db.golSugerido.updateMany({
    where: { id, status: "AUTOMATICO" },
    data: { status: "DESCARTADO", resolvidoEm: new Date(), eventoId: null },
  });
  if (count === 1 && sugestao.eventoId) {
    const eventoId = sugestao.eventoId;
    await db.$transaction(async (tx) => {
      const evento = await tx.eventoPartida.findUnique({ where: { id: eventoId } });
      if (!evento) return;
      await tx.eventoPartida.delete({ where: { id: eventoId } });
      const partida = await tx.partida.findUniqueOrThrow({ where: { id: sugestao.partidaId } });
      await tx.partida.update({
        where: { id: partida.id },
        data: evento.timeId === partida.timeCasaId ? { placarCasa: { decrement: 1 } } : { placarFora: { decrement: 1 } },
      });
    });
  }

  revalidarGolResolvido(tenantSlug, sugestao.partidaId);
  redirect(paths.admin.golsSugeridos(tenantSlug));
}
