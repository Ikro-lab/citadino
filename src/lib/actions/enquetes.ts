"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";
import { getOrCreateDeviceId } from "@/lib/device-id";

export async function createEnquete(formData: FormData) {
  await requireAdmin();
  const categoriaId = String(formData.get("categoriaId") || "");
  const rodada = Number(formData.get("rodada"));
  const pergunta = String(formData.get("pergunta") || "Melhor Jogador da Rodada").trim();
  const atletaIds = formData.getAll("atletaIds").map(String).filter(Boolean);

  if (!categoriaId || !rodada || atletaIds.length < 2) return;

  await prisma.enquete.create({
    data: {
      categoriaId,
      rodada,
      pergunta,
      opcoes: { create: atletaIds.map((atletaId) => ({ atletaId })) },
    },
  });
  revalidatePath("/admin/enquetes");
  revalidatePath("/enquete");
}

export async function toggleEnqueteAtiva(id: string, ativa: boolean) {
  await requireAdmin();
  await prisma.enquete.update({ where: { id }, data: { ativa } });
  revalidatePath("/admin/enquetes");
  revalidatePath("/enquete");
}

export async function deleteEnquete(id: string) {
  await requireAdmin();
  await prisma.enquete.delete({ where: { id } });
  revalidatePath("/admin/enquetes");
  revalidatePath("/enquete");
}

export type VotarState = { error?: string; success?: boolean } | undefined;

export async function votar(
  enqueteId: string,
  opcaoId: string
): Promise<VotarState> {
  const enquete = await prisma.enquete.findUnique({ where: { id: enqueteId } });
  if (!enquete || !enquete.ativa) return { error: "Enquete não está mais ativa." };

  const deviceId = await getOrCreateDeviceId();

  try {
    await prisma.enqueteVoto.create({
      data: { enqueteId, opcaoId, deviceId },
    });
  } catch {
    return { error: "Você já votou nesta enquete." };
  }

  revalidatePath("/enquete");
  return { success: true };
}
