"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import type { Posicao } from "@prisma/client";

async function assertCanManageTime(timeId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  if (session.user.role === "ADMIN") return;

  const time = await prisma.time.findUnique({
    where: { id: timeId },
    select: { treinadorId: true },
  });
  if (!time || time.treinadorId !== session.user.id) {
    throw new Error("Você não tem permissão para gerenciar este time.");
  }
}

function revalidateTimeViews(timeId: string) {
  revalidatePath(`/admin/times/${timeId}`);
  revalidatePath("/treinador");
}

export async function createAtleta(timeId: string, formData: FormData) {
  await assertCanManageTime(timeId);

  const nome = String(formData.get("nome") || "").trim();
  const numero = Number(formData.get("numero"));
  const posicao = String(formData.get("posicao") || "LINHA") as Posicao;
  const fotoUrl = String(formData.get("fotoUrl") || "").trim() || null;
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const dataNascimentoRaw = String(formData.get("dataNascimento") || "").trim();
  const dataNascimento = dataNascimentoRaw ? new Date(dataNascimentoRaw) : null;
  if (!nome || !numero || Number.isNaN(numero)) return;

  await prisma.atleta.create({
    data: { nome, numero, posicao, fotoUrl, instagram, dataNascimento, timeId },
  });
  revalidateTimeViews(timeId);
}

export async function updateAtleta(
  atletaId: string,
  timeId: string,
  formData: FormData
) {
  await assertCanManageTime(timeId);

  const nome = String(formData.get("nome") || "").trim();
  const numero = Number(formData.get("numero"));
  const posicao = String(formData.get("posicao") || "LINHA") as Posicao;
  const fotoUrl = String(formData.get("fotoUrl") || "").trim() || null;
  const instagram = String(formData.get("instagram") || "").trim() || null;
  const dataNascimentoRaw = String(formData.get("dataNascimento") || "").trim();
  const dataNascimento = dataNascimentoRaw ? new Date(dataNascimentoRaw) : null;
  if (!nome || !numero || Number.isNaN(numero)) return;

  await prisma.atleta.update({
    where: { id: atletaId },
    data: { nome, numero, posicao, fotoUrl, instagram, dataNascimento },
  });
  revalidateTimeViews(timeId);
}

export async function deleteAtleta(atletaId: string, timeId: string) {
  await assertCanManageTime(timeId);
  await prisma.atleta.delete({ where: { id: atletaId } });
  revalidateTimeViews(timeId);
}
