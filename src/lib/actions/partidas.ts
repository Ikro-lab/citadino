"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { auth } from "@/auth";
import { notifyPartidaEvento } from "@/lib/push/notify";
import { parseDatetimeLocalAsBRT } from "@/lib/date-utils";
import type { FasePartida, TipoEvento } from "@prisma/client";

export async function assertPodeEditarEvento(eventoId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");

  const evento = await prisma.eventoPartida.findUnique({
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
  if (session.user.role === "ADMIN") return;

  const partida = await prisma.partida.findUnique({
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
  await requireAdmin();
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

  await prisma.partida.create({
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
  revalidatePath("/admin/partidas");
  revalidatePath("/");
}

export async function updatePartida(id: string, formData: FormData) {
  await requireAdmin();
  const data = parseForm(formData);
  if (!data.categoriaId || !data.timeCasaId || !data.timeForaId || !data.dataHora) return;

  await prisma.partida.update({
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
  revalidatePath("/admin/partidas");
  revalidatePath(`/partida/${id}`);
  redirect("/admin/partidas");
}

export async function deletePartida(id: string) {
  await requireAdmin();
  await prisma.partida.delete({ where: { id } });
  revalidatePath("/admin/partidas");
}

export async function iniciarPartida(id: string) {
  await requireAdmin();
  const partida = await prisma.partida.update({
    where: { id },
    data: { status: "AO_VIVO" },
    include: { timeCasa: true, timeFora: true },
  });
  revalidatePath(`/admin/partidas/${id}/sumula`);
  revalidatePath("/");
  await notifyPartidaEvento(partida.id, {
    title: `Começou! ${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
    body: "A partida está ao vivo.",
  });
}

export async function encerrarPartida(id: string) {
  await requireAdmin();
  const partida = await prisma.partida.update({
    where: { id },
    data: { status: "ENCERRADA" },
    include: { timeCasa: true, timeFora: true },
  });
  revalidatePath(`/admin/partidas/${id}/sumula`);
  revalidatePath("/");
  revalidatePath("/classificacao");
  await notifyPartidaEvento(partida.id, {
    title: `Fim de jogo: ${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`,
    body: "Confira os detalhes da partida.",
  });
}

export async function adiarPartida(id: string) {
  await requireAdmin();
  await prisma.partida.update({ where: { id }, data: { status: "ADIADA" } });
  revalidatePath("/admin/partidas");
  revalidatePath("/");
}

export async function addEvento(partidaId: string, formData: FormData) {
  const tipo = String(formData.get("tipo") || "") as TipoEvento;
  const timeId = String(formData.get("timeId") || "");
  const atletaId = String(formData.get("atletaId") || "") || null;
  const minuto = Number(formData.get("minuto"));
  const descricao = String(formData.get("descricao") || "").trim() || null;

  if (!tipo || !timeId || Number.isNaN(minuto)) return;

  await assertPodeLancarEvento(partidaId, timeId);

  const partida = await prisma.$transaction(async (tx) => {
    await tx.eventoPartida.create({
      data: { partidaId, tipo, timeId, atletaId, minuto, descricao },
    });

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

  revalidatePath(`/admin/partidas/${partidaId}/sumula`);
  revalidatePath(`/partida/${partidaId}`);
  revalidatePath("/");

  if (tipo === "GOL") {
    const timeNome = timeId === partida.timeCasaId ? partida.timeCasa.nome : partida.timeFora.nome;
    await notifyPartidaEvento(partidaId, {
      title: `Gol de ${timeNome}!`,
      body: `${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`,
    });
  } else if (tipo === "CARTAO_VERMELHO") {
    await notifyPartidaEvento(partidaId, {
      title: "Cartão vermelho!",
      body: `${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
    });
  }
}

export async function deleteEvento(eventoId: string, partidaId: string) {
  await requireAdmin();

  await prisma.$transaction(async (tx) => {
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

  revalidatePath(`/admin/partidas/${partidaId}/sumula`);
  revalidatePath(`/partida/${partidaId}`);
  revalidatePath("/");
}

export async function setEventoVideo(eventoId: string, videoUrl: string) {
  const evento = await assertPodeEditarEvento(eventoId);
  if (!videoUrl) return;

  await prisma.eventoPartida.update({
    where: { id: eventoId },
    data: { videoUrl },
  });

  revalidatePath(`/admin/partidas/${evento.partidaId}/sumula`);
  revalidatePath(`/treinador/partidas/${evento.partidaId}/sumula`);
  revalidatePath(`/partida/${evento.partidaId}`);
}

export async function setLinkTransmissao(partidaId: string, formData: FormData) {
  await requireAdmin();
  const url = String(formData.get("linkTransmissaoUrl") || "").trim() || null;

  await prisma.partida.update({
    where: { id: partidaId },
    data: { linkTransmissaoUrl: url },
  });

  revalidatePath(`/admin/partidas/${partidaId}/sumula`);
  revalidatePath(`/partida/${partidaId}`);
}
