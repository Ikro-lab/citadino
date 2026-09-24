"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { requireAdmin } from "@/lib/require-role";
import { auth } from "@/auth";
import { paths } from "@/lib/tenant-path";
import { notifyPartidaEvento } from "@/lib/push/notify";
import { parseDatetimeLocalAsBRT } from "@/lib/date-utils";
import { extrairYoutubeId, segundoDoLink, youtubeUrlNoSegundo } from "@/lib/youtube";
import { buscarInicioLiveYoutube } from "@/lib/youtube-live";
import type { FasePartida, TipoEvento } from "@prisma/client";

// Quem lança o gol na súmula normalmente registra alguns segundos depois do
// lance. O link do clipe volta esse tempo; o player ainda mostra 10s antes.
const ATRASO_REGISTRO_SEGUNDOS = 12;

type TenantDb = ReturnType<typeof getTenantPrisma>;

/**
 * Garante que a partida sabe quando a live começou, perguntando ao YouTube
 * se ainda não souber. Retorna o início (ou null se não deu para descobrir).
 */
async function garantirInicioLive(
  db: TenantDb,
  partida: { id: string; linkTransmissaoUrl: string | null; transmissaoInicioEm: Date | null }
): Promise<Date | null> {
  if (partida.transmissaoInicioEm) return partida.transmissaoInicioEm;
  const videoId = extrairYoutubeId(partida.linkTransmissaoUrl);
  if (!videoId) return null;

  const inicio = await buscarInicioLiveYoutube(videoId);
  if (inicio) {
    await db.partida.update({ where: { id: partida.id }, data: { transmissaoInicioEm: inicio } });
  }
  return inicio;
}

export async function assertPodeEditarEvento(eventoId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  const db = getTenantPrisma(session.user.tenantId!);

  const evento = await db.eventoPartida.findUnique({
    where: { id: eventoId },
    select: {
      partidaId: true,
      timeId: true,
      partida: {
        select: {
          timeCasaId: true,
          timeForaId: true,
          timeCasa: { select: { treinadorId: true } },
          timeFora: { select: { treinadorId: true } },
        },
      },
    },
  });
  if (!evento) throw new Error("Evento não encontrado.");
  if (session.user.role === "ADMIN") return evento;

  const timeDoTreinador =
    evento.partida.timeCasa.treinadorId === session.user.id
      ? evento.partida.timeCasaId
      : evento.partida.timeFora.treinadorId === session.user.id
        ? evento.partida.timeForaId
        : null;

  if (!timeDoTreinador || timeDoTreinador !== evento.timeId) {
    throw new Error("Você só pode editar eventos do seu próprio time.");
  }
  return evento;
}

async function assertPodeLancarEvento(partidaId: string, timeId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  const db = getTenantPrisma(session.user.tenantId!);
  if (session.user.role === "ADMIN") return;

  const partida = await db.partida.findUnique({
    where: { id: partidaId },
    select: {
      status: true,
      timeCasaId: true,
      timeForaId: true,
      timeCasa: { select: { treinadorId: true } },
      timeFora: { select: { treinadorId: true } },
    },
  });
  if (!partida) throw new Error("Partida não encontrada.");
  if (partida.status !== "AO_VIVO") {
    throw new Error("Só é possível lançar eventos com a partida ao vivo.");
  }

  const timeDoTreinador =
    partida.timeCasa.treinadorId === session.user.id
      ? partida.timeCasaId
      : partida.timeFora.treinadorId === session.user.id
        ? partida.timeForaId
        : null;

  if (!timeDoTreinador || timeDoTreinador !== timeId) {
    throw new Error("Você só pode lançar eventos do seu próprio time.");
  }
}

function parseForm(formData: FormData) {
  return {
    categoriaId: String(formData.get("categoriaId") || ""),
    timeCasaId: String(formData.get("timeCasaId") || ""),
    timeForaId: String(formData.get("timeForaId") || ""),
    dataHora: String(formData.get("dataHora") || ""),
    local: String(formData.get("local") || "").trim() || null,
    rodada: formData.get("rodada") ? Number(formData.get("rodada")) : null,
    fase: (String(formData.get("fase") || "GRUPOS")) as FasePartida,
  };
}

export async function createPartida(formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  const data = parseForm(formData);
  if (
    !data.categoriaId ||
    !data.timeCasaId ||
    !data.timeForaId ||
    !data.dataHora ||
    data.timeCasaId === data.timeForaId
  ) {
    return;
  }

  await db.partida.create({
    data: {
      tenantId: session.user.tenantId!,
      categoriaId: data.categoriaId,
      timeCasaId: data.timeCasaId,
      timeForaId: data.timeForaId,
      dataHora: parseDatetimeLocalAsBRT(data.dataHora),
      local: data.local,
      rodada: data.rodada,
      fase: data.fase,
    },
  });
  revalidatePath(paths.admin.partidas(tenantSlug));
  revalidatePath(paths.home(tenantSlug));
}

export async function updatePartida(id: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  const data = parseForm(formData);
  if (!data.categoriaId || !data.timeCasaId || !data.timeForaId || !data.dataHora) return;

  await db.partida.update({
    where: { id },
    data: {
      categoriaId: data.categoriaId,
      timeCasaId: data.timeCasaId,
      timeForaId: data.timeForaId,
      dataHora: parseDatetimeLocalAsBRT(data.dataHora),
      local: data.local,
      rodada: data.rodada,
      fase: data.fase,
    },
  });
  revalidatePath(paths.admin.partidas(tenantSlug));
  revalidatePath(paths.partida(tenantSlug, id));
  redirect(paths.admin.partidas(tenantSlug));
}

export async function deletePartida(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.partida.delete({ where: { id } });
  revalidatePath(paths.admin.partidas(session.user.tenantSlug!));
}

export async function iniciarPartida(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  const partida = await db.partida.update({
    where: { id },
    data: { status: "AO_VIVO" },
    include: { timeCasa: true, timeFora: true },
  });
  await garantirInicioLive(db, partida);
  revalidatePath(paths.admin.partidaSumula(tenantSlug, id));
  revalidatePath(paths.home(tenantSlug));
  await notifyPartidaEvento(session.user.tenantId!, partida.id, {
    title: `Começou! ${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
    body: "A partida está ao vivo.",
  });
}

export async function encerrarPartida(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  const partida = await db.partida.update({
    where: { id },
    data: { status: "ENCERRADA" },
    include: { timeCasa: true, timeFora: true },
  });
  revalidatePath(paths.admin.partidaSumula(tenantSlug, id));
  revalidatePath(paths.home(tenantSlug));
  revalidatePath(paths.classificacao(tenantSlug));
  await notifyPartidaEvento(session.user.tenantId!, partida.id, {
    title: `Fim de jogo: ${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`,
    body: "Confira os detalhes da partida.",
  });
}

export async function adiarPartida(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  await db.partida.update({ where: { id }, data: { status: "ADIADA" } });
  revalidatePath(paths.admin.partidas(tenantSlug));
  revalidatePath(paths.home(tenantSlug));
}

export async function addEvento(partidaId: string, formData: FormData) {
  const tipo = String(formData.get("tipo") || "") as TipoEvento;
  const timeId = String(formData.get("timeId") || "");
  const atletaId = String(formData.get("atletaId") || "") || null;
  const minuto = Number(formData.get("minuto"));
  const descricao = String(formData.get("descricao") || "").trim() || null;

  if (!tipo || !timeId || Number.isNaN(minuto)) return;

  await assertPodeLancarEvento(partidaId, timeId);

  const session = await auth();
  const tenantId = session!.user.tenantId!;
  const tenantSlug = session!.user.tenantSlug!;
  const db = getTenantPrisma(tenantId);

  let eventoId = "";
  const partida = await db.$transaction(async (tx) => {
    const evento = await tx.eventoPartida.create({
      data: { tenantId, partidaId, tipo, timeId, atletaId, minuto, descricao },
    });
    eventoId = evento.id;

    if (tipo === "GOL") {
      const current = await tx.partida.findUniqueOrThrow({ where: { id: partidaId } });
      const isCasa = timeId === current.timeCasaId;
      return tx.partida.update({
        where: { id: partidaId },
        data: isCasa
          ? { placarCasa: { increment: 1 } }
          : { placarFora: { increment: 1 } },
        include: { timeCasa: true, timeFora: true },
      });
    }

    return tx.partida.findUniqueOrThrow({
      where: { id: partidaId },
      include: { timeCasa: true, timeFora: true },
    });
  });

  // Gol com live no YouTube: o lance ganha o link do vídeo já no minuto certo.
  const videoId = extrairYoutubeId(partida.linkTransmissaoUrl);
  if (tipo === "GOL" && videoId) {
    const registradoEm = Date.now();
    const inicio = await garantirInicioLive(db, partida);
    if (inicio) {
      const segundo = Math.floor((registradoEm - inicio.getTime()) / 1000) - ATRASO_REGISTRO_SEGUNDOS;
      if (segundo > 0) {
        await db.eventoPartida.update({
          where: { id: eventoId },
          data: { videoUrl: youtubeUrlNoSegundo(videoId, segundo) },
        });
      }
    }
  }

  revalidatePath(paths.admin.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.treinador.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.partida(tenantSlug, partidaId));
  revalidatePath(paths.home(tenantSlug));

  if (tipo === "GOL") {
    const timeNome = timeId === partida.timeCasaId ? partida.timeCasa.nome : partida.timeFora.nome;
    await notifyPartidaEvento(tenantId, partidaId, {
      title: `Gol de ${timeNome}!`,
      body: `${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`,
    });
  } else if (tipo === "CARTAO_VERMELHO") {
    await notifyPartidaEvento(tenantId, partidaId, {
      title: "Cartão vermelho!",
      body: `${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
    });
  }
}

export async function deleteEvento(eventoId: string, partidaId: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;

  await db.$transaction(async (tx) => {
    const evento = await tx.eventoPartida.delete({ where: { id: eventoId } });

    if (evento.tipo === "GOL") {
      const current = await tx.partida.findUniqueOrThrow({ where: { id: partidaId } });
      const isCasa = evento.timeId === current.timeCasaId;
      await tx.partida.update({
        where: { id: partidaId },
        data: isCasa
          ? { placarCasa: { decrement: 1 } }
          : { placarFora: { decrement: 1 } },
      });
    }
  });

  revalidatePath(paths.admin.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.partida(tenantSlug, partidaId));
  revalidatePath(paths.home(tenantSlug));
}

export async function setEventoVideo(eventoId: string, videoUrl: string) {
  const evento = await assertPodeEditarEvento(eventoId);
  if (!videoUrl) return;

  const session = await auth();
  const tenantSlug = session!.user.tenantSlug!;
  const db = getTenantPrisma(session!.user.tenantId!);

  await db.eventoPartida.update({
    where: { id: eventoId },
    data: { videoUrl },
  });

  revalidatePath(paths.admin.partidaSumula(tenantSlug, evento.partidaId));
  revalidatePath(paths.treinador.partidaSumula(tenantSlug, evento.partidaId));
  revalidatePath(paths.partida(tenantSlug, evento.partidaId));
}

export async function setLinkTransmissao(partidaId: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;
  const url = String(formData.get("linkTransmissaoUrl") || "").trim() || null;

  const atual = await db.partida.findUniqueOrThrow({ where: { id: partidaId } });
  const mudouLink = atual.linkTransmissaoUrl !== url;

  const partida = await db.partida.update({
    where: { id: partidaId },
    // Link novo = outra live: o início antigo não vale mais.
    data: { linkTransmissaoUrl: url, ...(mudouLink ? { transmissaoInicioEm: null } : {}) },
  });
  await garantirInicioLive(db, partida);

  revalidatePath(paths.admin.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.partida(tenantSlug, partidaId));
}

/**
 * Plano B quando o YouTube não informa o início: o organizador toca no botão
 * no momento em que a live entra no ar.
 */
export async function marcarInicioLiveAgora(partidaId: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.partida.update({ where: { id: partidaId }, data: { transmissaoInicioEm: new Date() } });
  revalidatePath(paths.admin.partidaSumula(session.user.tenantSlug!, partidaId));
}

/** Tenta de novo ler o início da live no YouTube (ex: a live entrou no ar depois de salvar o link). */
export async function sincronizarInicioLive(partidaId: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const partida = await db.partida.findUniqueOrThrow({ where: { id: partidaId } });
  await garantirInicioLive(db, { ...partida, transmissaoInicioEm: null });
  revalidatePath(paths.admin.partidaSumula(session.user.tenantSlug!, partidaId));
}

/** Ajuste fino do clipe automático: adianta ou atrasa o ponto do vídeo em alguns segundos. */
export async function ajustarClipeEvento(eventoId: string, deltaSegundos: number) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const tenantSlug = session.user.tenantSlug!;

  const evento = await db.eventoPartida.findUniqueOrThrow({ where: { id: eventoId } });
  const videoId = extrairYoutubeId(evento.videoUrl);
  const segundo = evento.videoUrl ? segundoDoLink(evento.videoUrl) : null;
  if (!videoId || segundo === null) return;

  await db.eventoPartida.update({
    where: { id: eventoId },
    data: { videoUrl: youtubeUrlNoSegundo(videoId, segundo + deltaSegundos) },
  });

  revalidatePath(paths.admin.partidaSumula(tenantSlug, evento.partidaId));
  revalidatePath(paths.partida(tenantSlug, evento.partidaId));
}
