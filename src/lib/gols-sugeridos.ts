import "server-only";
import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { notifyAdmins } from "@/lib/push/notify";
import { paths } from "@/lib/tenant-path";
import { extrairYoutubeId, youtubeUrlNoSegundo } from "@/lib/youtube";

/**
 * Gol detectado pelo placar da transmissão (monitor da live) e o gol lançado
 * pelo admin na súmula se encontram por partida + time dentro desta janela.
 */
export const JANELA_GOL_MS = 5 * 60 * 1000;

type Sugestao = {
  tenantId: string;
  videoId: string;
  lado: "casa" | "fora";
  segundo: number;
  placarCasa: number;
  placarFora: number;
};

/**
 * Registra um gol visto na live. Se o admin já lançou esse gol na súmula, só
 * acerta o clipe dele; senão vira um gol pendente e os admins recebem o aviso
 * para aprovar e escolher o autor.
 */
export async function registrarGolSugerido(s: Sugestao) {
  const db = getTenantPrisma(s.tenantId);
  const partida = await db.partida.findFirst({
    where: { status: "AO_VIVO", linkTransmissaoUrl: { contains: s.videoId } },
    orderBy: { iniciadaEm: "desc" },
    include: { timeCasa: { select: { nome: true } }, timeFora: { select: { nome: true } }, tenant: { select: { slug: true } } },
  });
  if (!partida) return { resultado: "sem_partida" as const };

  const timeId = s.lado === "casa" ? partida.timeCasaId : partida.timeForaId;
  const desde = new Date(Date.now() - JANELA_GOL_MS);

  // O mesmo gol já informado (o monitor reenvia se cair no meio).
  const repetida = await db.golSugerido.findFirst({
    where: { partidaId: partida.id, timeId, placarCasa: s.placarCasa, placarFora: s.placarFora, createdAt: { gte: desde } },
  });
  if (repetida) return { resultado: "repetida" as const, id: repetida.id };

  // Gol que o admin já lançou e ainda não foi casado com nenhum visto na live.
  const casados = await db.golSugerido.findMany({
    where: { partidaId: partida.id, eventoId: { not: null } },
    select: { eventoId: true },
  });
  const lancado = await db.eventoPartida.findFirst({
    where: {
      partidaId: partida.id,
      timeId,
      tipo: "GOL",
      createdAt: { gte: desde },
      id: { notIn: casados.map((c) => c.eventoId!) },
    },
    orderBy: { createdAt: "asc" },
  });

  const tenantSlug = partida.tenant.slug;
  if (lancado) {
    await db.eventoPartida.update({
      where: { id: lancado.id },
      data: { videoUrl: youtubeUrlNoSegundo(s.videoId, s.segundo) },
    });
    const sugestao = await db.golSugerido.create({
      data: {
        tenantId: s.tenantId,
        partidaId: partida.id,
        timeId,
        placarCasa: s.placarCasa,
        placarFora: s.placarFora,
        videoSegundo: s.segundo,
        status: "LANCADO",
        eventoId: lancado.id,
        resolvidoEm: new Date(),
      },
    });
    revalidatePath(paths.partida(tenantSlug, partida.id));
    revalidatePath(paths.admin.partidaSumula(tenantSlug, partida.id));
    return { resultado: "clipe_acertado" as const, id: sugestao.id };
  }

  const sugestao = await db.golSugerido.create({
    data: {
      tenantId: s.tenantId,
      partidaId: partida.id,
      timeId,
      placarCasa: s.placarCasa,
      placarFora: s.placarFora,
      videoSegundo: s.segundo,
    },
  });
  const timeNome = s.lado === "casa" ? partida.timeCasa.nome : partida.timeFora.nome;
  await notifyAdmins(s.tenantId, {
    title: `Gol de ${timeNome}?`,
    body: `${partida.timeCasa.nome} ${s.placarCasa} x ${s.placarFora} ${partida.timeFora.nome} na transmissão. Toque para aprovar e escolher quem fez.`,
    url: paths.admin.golSugerido(tenantSlug, sugestao.id),
  });
  revalidatePath(paths.admin.partidaSumula(tenantSlug, partida.id));
  return { resultado: "pendente" as const, id: sugestao.id };
}

/**
 * Gol lançado na mão pelo admin: se a live já tinha mostrado esse gol, o
 * pendente some (sem lançar em dobro) e o lance fica com o clipe da live.
 */
export async function casarGolLancado(tenantId: string, eventoId: string) {
  const db = getTenantPrisma(tenantId);
  const evento = await db.eventoPartida.findUnique({
    where: { id: eventoId },
    include: { partida: { select: { linkTransmissaoUrl: true } } },
  });
  if (!evento || evento.tipo !== "GOL") return;

  const pendente = await db.golSugerido.findFirst({
    where: {
      partidaId: evento.partidaId,
      timeId: evento.timeId,
      status: "PENDENTE",
      createdAt: { gte: new Date(Date.now() - JANELA_GOL_MS) },
    },
    orderBy: { createdAt: "asc" },
  });
  if (!pendente) return;

  const { count } = await db.golSugerido.updateMany({
    where: { id: pendente.id, status: "PENDENTE" },
    data: { status: "LANCADO", eventoId, resolvidoEm: new Date() },
  });
  const videoId = extrairYoutubeId(evento.partida.linkTransmissaoUrl);
  if (count === 1 && videoId) {
    await db.eventoPartida.update({
      where: { id: eventoId },
      data: { videoUrl: youtubeUrlNoSegundo(videoId, pendente.videoSegundo) },
    });
  }
}
