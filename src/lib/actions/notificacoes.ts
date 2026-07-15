"use server";

import { requireAdmin } from "@/lib/require-role";
import { notifyBroadcast } from "@/lib/push/notify";
import { prisma } from "@/lib/prisma";

export type BroadcastState = { message?: string } | undefined;

export async function enviarAvisoGeral(
  _prevState: BroadcastState,
  formData: FormData
): Promise<BroadcastState> {
  await requireAdmin();
  const titulo = String(formData.get("titulo") || "").trim();
  const mensagem = String(formData.get("mensagem") || "").trim();
  if (!titulo || !mensagem) return { message: "Preencha título e mensagem." };

  const total = await prisma.pushSubscription.count();
  await notifyBroadcast({ title: titulo, body: mensagem });

  return { message: `Aviso enviado para ${total} inscrito(s).` };
}
