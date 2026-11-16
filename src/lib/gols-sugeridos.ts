import "server-only";
import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { notifyAdmins, notifyPartidaEvento } from "@/lib/push/notify";
import { minutoDeJogo } from "@/lib/escalacao";
import { paths } from "@/lib/tenant-path";
import { extrairYoutubeId, youtubeUrlNoSegundo } from "@/lib/youtube";

/**
 * Gol detectado pelo placar da transmissão (monitor da live) e o gol lançado
 * pelo admin na súmula se encontram por partida + time dentro desta janela.
 */
export const JANELA_GOL_MS = 5 * 60 * 1000;

/** O monitor percebe o gol pelo placar da live ~1 min depois do lance. */
export const ATRASO_DETECCAO_MS = 80 * 1000;

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
 * acerta o clipe dele. Se o placar da live é o do site mais este gol, lança
 * sozinho (sem autor) e os admins só escolhem quem fez. Senão vira um gol
 * pendente e os admins recebem o aviso para aprovar.
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

  const timeNome = s.lado === "casa" ? partida.timeCasa.nome : partida.timeFora.nome;

  // Placar da live = placar do site + 1 gol deste time: lança sozinho, sem autor.
  // Qualquer outra leitura (OCR errado, gol que o site não tem) fica para o admin.
  const esperado = {
    placarCasa: partida.placarCasa + (s.lado === "casa" ? 1 : 0),
    placarFora: partida.placarFora + (s.lado === "fora" ? 1 : 0),
  };
  if (s.placarCasa === esperado.placarCasa && s.placarFora === esperado.placarFora) {
    const automatico = await lancarGolAutomatico(db, s, partida, timeId);
    if (automatico) {
      revalidarGol(tenantSlug, partida.id);
      await notifyPartidaEvento(s.tenantId, partida.id, {
        title: `Gol de ${timeNome}!`,
        body: `${partida.timeCasa.nome} ${s.placarCasa} x ${s.placarFora} ${partida.timeFora.nome}`,
      });
      await notifyAdmins(s.tenantId, {
        title: `Gol de ${timeNome} lançado`,
        body: `${partida.timeCasa.nome} ${s.placarCasa} x ${s.placarFora} ${partida.timeFora.nome}, pela transmissão. Toque para escolher quem fez (ou anular).`,
        url: paths.admin.golSugerido(tenantSlug, automatico.id),
      });
      return { resultado: "lancado_automatico" as const, id: automatico.id };
    }
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
  await notifyAdmins(s.tenantId, {
    title: `Gol de ${timeNome}?`,
    body: `${partida.timeCasa.nome} ${s.placarCasa} x ${s.placarFora} ${partida.timeFora.nome} na transmissão. Toque para aprovar e escolher quem fez.`,
    url: paths.admin.golSugerido(tenantSlug, sugestao.id),
  });
  revalidatePath(paths.admin.partidaSumula(tenantSlug, partida.id));
  return { resultado: "pendente" as const, id: sugestao.id };
}

type Db = ReturnType<typeof getTenantPrisma>;
type PartidaDoGol = Parameters<typeof minutoDeJogo>[0] & {
  id: string;
  timeCasaId: string;
  placarCasa: number;
  placarFora: number;
};

/**
 * Lança na súmula o gol visto na live, sem autor. O placar só sobe se ainda for
 * o que o monitor viu antes do gol: dois envios ao mesmo tempo não lançam em dobro.
 */
async function lancarGolAutomatico(db: Db, s: Sugestao, partida: PartidaDoGol, timeId: string) {
  const minuto = minutoDeJogo(partida, Date.now() - ATRASO_DETECCAO_MS);
  try {
    return await db.$transaction(async (tx) => {
      const { count } = await tx.partida.updateMany({
        where: { id: partida.id, status: "AO_VIVO", placarCasa: partida.placarCasa, placarFora: partida.placarFora },
        data: timeId === partida.timeCasaId ? { placarCasa: { increment: 1 } } : { placarFora: { increment: 1 } },
      });
      if (count !== 1) throw new PlacarMudou();
      const evento = await tx.eventoPartida.create({
        data: {
          tenantId: s.tenantId,
          partidaId: partida.id,
          tipo: "GOL",
          timeId,
          minuto,
          videoUrl: youtubeUrlNoSegundo(s.videoId, s.segundo),
        },
      });
      return tx.golSugerido.create({
        data: {
          tenantId: s.tenantId,
          partidaId: partida.id,
          timeId,
          placarCasa: s.placarCasa,
          placarFora: s.placarFora,
          videoSegundo: s.segundo,
          status: "AUTOMATICO",
          eventoId: evento.id,
          resolvidoEm: new Date(),
        },
      });
    });
  } catch (e) {
    if (e instanceof PlacarMudou) return null;
    throw e;
  }
}

class PlacarMudou extends Error {}

function revalidarGol(tenantSlug: string, partidaId: string) {
  revalidatePath(paths.admin.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.partida(tenantSlug, partidaId));
  revalidatePath(paths.home(tenantSlug));
  revalidatePath(paths.artilharia(tenantSlug));
  revalidatePath(paths.admin.golsSugeridos(tenantSlug));
}

/**
 * Gol lançado na mão pelo admin: se a live já tinha mostrado esse gol, o
 * pendente some (sem lançar em dobro) e o lance fica com o clipe da live.
 * Se o monitor já lançou esse gol sozinho, o lance do admin se junta a ele
 * (o autor e o minuto do admin valem) e o placar não sobe duas vezes.
 * Devolve `mesclado: true` nesse caso, para não avisar o gol de novo.
 */
export async function casarGolLancado(tenantId: string, eventoId: string): Promise<{ mesclado: boolean }> {
  const db = getTenantPrisma(tenantId);
  const evento = await db.eventoPartida.findUnique({
    where: { id: eventoId },
    include: { partida: { select: { linkTransmissaoUrl: true, timeCasaId: true } } },
  });
  if (!evento || evento.tipo !== "GOL") return { mesclado: false };

  const automatico = await db.golSugerido.findFirst({
    where: {
      partidaId: evento.partidaId,
      timeId: evento.timeId,
      status: "AUTOMATICO",
      createdAt: { gte: new Date(Date.now() - JANELA_GOL_MS) },
    },
    orderBy: { createdAt: "asc" },
  });
  if (automatico?.eventoId) {
    const { count } = await db.golSugerido.updateMany({
      where: { id: automatico.id, status: "AUTOMATICO" },
      data: { status: "APROVADO", resolvidoEm: new Date() },
    });
    if (count === 1) {
      const automaticoEventoId = automatico.eventoId;
      await db.$transaction(async (tx) => {
        await tx.eventoPartida.update({
          where: { id: automaticoEventoId },
          data: { atletaId: evento.atletaId, minuto: evento.minuto, lancadoPorId: evento.lancadoPorId },
        });
        await tx.eventoPartida.delete({ where: { id: evento.id } });
        await tx.partida.update({
          where: { id: evento.partidaId },
          data:
            evento.timeId === evento.partida.timeCasaId ? { placarCasa: { decrement: 1 } } : { placarFora: { decrement: 1 } },
        });
      });
      return { mesclado: true };
    }
  }

  const pendente = await db.golSugerido.findFirst({
    where: {
      partidaId: evento.partidaId,
      timeId: evento.timeId,
      status: "PENDENTE",
      createdAt: { gte: new Date(Date.now() - JANELA_GOL_MS) },
    },
    orderBy: { createdAt: "asc" },
  });
  if (!pendente) return { mesclado: false };

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
  return { mesclado: false };
}

/** Gols detectados com a partida e o elenco do time do gol (para escolher o autor). */
export async function buscarGolsSugeridos(db: Db, where: { id?: string; status?: string | { notIn: string[] } }, take = 30) {
  const sugestoes = await db.golSugerido.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
    include: {
      partida: {
        select: {
          id: true,
          linkTransmissaoUrl: true,
          categoria: { select: { nome: true } },
          timeCasa: { select: { id: true, nome: true } },
          timeFora: { select: { id: true, nome: true } },
        },
      },
    },
  });
  const atletas = await db.atleta.findMany({
    where: { timeId: { in: [...new Set(sugestoes.map((s) => s.timeId))] } },
    orderBy: { numero: "asc" },
    select: { id: true, nome: true, apelido: true, numero: true, timeId: true },
  });
  return sugestoes.map((sugestao) => ({ sugestao, atletas: atletas.filter((a) => a.timeId === sugestao.timeId) }));
}
