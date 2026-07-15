"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/require-role";

export async function aprovarSolicitacao(id: string, formData: FormData) {
  await requireAdmin();
  const categoriaId = String(formData.get("categoriaId") || "");
  if (!categoriaId) return;

  const solicitacao = await prisma.solicitacaoTime.findUnique({ where: { id } });
  if (!solicitacao || solicitacao.status !== "PENDENTE") return;

  await prisma.$transaction(async (tx) => {
    const time = await tx.time.create({
      data: {
        nome: solicitacao.nomeTime,
        categoriaId,
        treinadorId: solicitacao.treinadorId,
      },
    });

    await tx.solicitacaoTime.update({
      where: { id },
      data: { status: "APROVADA", timeId: time.id, categoriaId },
    });
  });

  revalidatePath("/admin/solicitacoes");
  revalidatePath("/admin/times");
}

export async function recusarSolicitacao(id: string) {
  await requireAdmin();
  await prisma.solicitacaoTime.update({
    where: { id },
    data: { status: "RECUSADA" },
  });
  revalidatePath("/admin/solicitacoes");
}
