"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { ERRO_TREINADOR_MESMA_CATEGORIA, treinadorTemTimeNaCategoria } from "@/lib/treinador-categoria";

export async function aprovarSolicitacao(id: string, formData: FormData) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  const categoriaId = String(formData.get("categoriaId") || "");
  if (!categoriaId) return;

  const solicitacao = await db.solicitacaoTime.findUnique({ where: { id } });
  if (!solicitacao || solicitacao.status !== "PENDENTE") return;
  if (await treinadorTemTimeNaCategoria(db, solicitacao.treinadorId, categoriaId)) {
    redirect(`${paths.admin.solicitacoes(session.user.tenantSlug!)}?erro=${encodeURIComponent(ERRO_TREINADOR_MESMA_CATEGORIA)}`);
  }

  await db.$transaction(async (tx) => {
    const time = await tx.time.create({
      data: {
        tenantId: session.user.tenantId!,
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

  revalidatePath(paths.admin.solicitacoes(session.user.tenantSlug!));
  revalidatePath(paths.admin.times(session.user.tenantSlug!));
}

export async function recusarSolicitacao(id: string) {
  const session = await requireAdmin();
  const db = getTenantPrisma(session.user.tenantId!);
  await db.solicitacaoTime.update({
    where: { id },
    data: { status: "RECUSADA" },
  });
  revalidatePath(paths.admin.solicitacoes(session.user.tenantSlug!));
}
