"use server";

import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { notifyBroadcast } from "@/lib/push/notify";

export type BroadcastState = { message?: string } | undefined;

export async function enviarAvisoGeral(
  _prevState: BroadcastState,
  formData: FormData
): Promise<BroadcastState> {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const titulo = String(formData.get("titulo") || "").trim();
  const mensagem = String(formData.get("mensagem") || "").trim();
  if (!titulo || !mensagem) return { message: "Preencha título e mensagem." };

  const total = await db.pushSubscription.count();
  await notifyBroadcast(session.user.tenantId!, { title: titulo, body: mensagem });

  return { message: `Aviso enviado para ${total} inscrito(s).` };
}
