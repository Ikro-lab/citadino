"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { requireAdmin } from "@/lib/require-role";
import { paths } from "@/lib/tenant-path";
import { notifyPartidaEvento } from "@/lib/push/notify";
import { extrairYoutubeId, youtubeUrlNoSegundo } from "@/lib/youtube";
import { minutoDeJogo } from "@/lib/escalacao";

// O monitor percebe o gol pelo placar da live ~1 min depois do lance.
const ATRASO_DETECCAO_MS = 80 * 1000;

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
  if (count === 0) redirect(paths.admin.golSugerido(tenantSlug, id));

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

  const timeNome = sugestao.timeId === partida.timeCasaId ? partida.timeCasa.nome : partida.timeFora.nome;
  await notifyPartidaEvento(tenantId, partida.id, {
    title: `Gol de ${timeNome}!`,
    body: `${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`,
  });

  redirect(paths.admin.golSugerido(tenantSlug, id));
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
  redirect(paths.admin.partidaSumula(tenantSlug, sugestao.partidaId));
}
