import "server-only";
import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { notifyAdmins, notifyPartidaEvento } from "@/lib/push/notify";
import { paths } from "@/lib/tenant-path";
import { minutoDeJogo } from "@/lib/escalacao";
import { extrairYoutubeId, youtubeUrlNoSegundo } from "@/lib/youtube";

/**
 * Gol lançado pela transmissão (monitor da live) e o gol lançado pelo admin
 * na súmula se encontram por partida + time dentro desta janela.
 */
export const JANELA_GOL_MS = 5 * 60 * 1000;

/** O monitor percebe o gol pelo placar da live ~1 min depois do lance. */
export const ATRASO_DETECCAO_MS = 80 * 1000;

/**
 * Situações de um gol visto na live:
 * - CLIPE: o gol já está na súmula (lançado pela transmissão ou pelo admin) e o
 *   clipe espera aprovação; até lá o lance fica sem vídeo.
 * - PENDENTE: o placar da live não bateu com o do site; o gol só entra se aprovado.
 * - APROVADO, SEM_CLIPE, DESCARTADO e LANCADO (antigo) já estão resolvidos.
 */
export const STATUS_ESPERANDO = ["PENDENTE", "CLIPE"];

type Sugestao = {
  tenantId: string;
  videoId: string;
  lado: "casa" | "fora";
  segundo: number;
  placarCasa: number;
  placarFora: number;
};

function revalidarPartida(tenantSlug: string, partidaId: string) {
  revalidatePath(paths.partida(tenantSlug, partidaId));
  revalidatePath(paths.admin.partidaSumula(tenantSlug, partidaId));
  revalidatePath(paths.home(tenantSlug));
  revalidatePath(paths.artilharia(tenantSlug));
  revalidatePath(paths.admin.golsSugeridos(tenantSlug));
}

async function partidaDaLive(tenantId: string, videoId: string) {
  return getTenantPrisma(tenantId).partida.findFirst({
    where: { status: "AO_VIVO", linkTransmissaoUrl: { contains: videoId } },
    orderBy: { iniciadaEm: "desc" },
    include: { timeCasa: { select: { nome: true } }, timeFora: { select: { nome: true } }, tenant: { select: { slug: true } } },
  });
}

/**
 * Gol visto na live. O placar da live decide o que fazer:
 * - igual ao do site: o admin já lançou; o lance ganha o clipe na hora;
 * - um a mais que o do site, do lado do gol: o gol entra na súmula sozinho (sem
 *   autor), o público é avisado e o clipe espera aprovação;
 * - qualquer outra coisa (placar da live trocado, jogo errado): fica pendente e
 *   o gol só entra se o admin aprovar.
 */
export async function registrarGolSugerido(s: Sugestao) {
  const db = getTenantPrisma(s.tenantId);
  const partida = await partidaDaLive(s.tenantId, s.videoId);
  if (!partida) return { resultado: "sem_partida" as const };

  const timeId = s.lado === "casa" ? partida.timeCasaId : partida.timeForaId;
  const timeNome = s.lado === "casa" ? partida.timeCasa.nome : partida.timeFora.nome;
  const tenantSlug = partida.tenant.slug;
  const dados = {
    tenantId: s.tenantId,
    partidaId: partida.id,
    timeId,
    placarCasa: s.placarCasa,
    placarFora: s.placarFora,
    videoSegundo: s.segundo,
  };
  // O clipe entra no lance junto com o gol; o admin só ajusta ou tira se precisar.
  const clipe = youtubeUrlNoSegundo(s.videoId, s.segundo);

  // O mesmo gol já informado (o monitor reenvia se cair no meio).
  const repetida = await db.golSugerido.findFirst({
    where: {
      partidaId: partida.id,
      timeId,
      placarCasa: s.placarCasa,
      placarFora: s.placarFora,
      createdAt: { gte: new Date(Date.now() - JANELA_GOL_MS) },
    },
  });
  if (repetida) return { resultado: "repetida" as const, id: repetida.id };

  const igual = s.placarCasa === partida.placarCasa && s.placarFora === partida.placarFora;
  const umAMais =
    s.lado === "casa"
      ? s.placarCasa === partida.placarCasa + 1 && s.placarFora === partida.placarFora
      : s.placarFora === partida.placarFora + 1 && s.placarCasa === partida.placarCasa;

  if (igual) {
    // Gol que o admin já lançou e ainda não ganhou clipe da live.
    const casados = await db.golSugerido.findMany({
      where: { partidaId: partida.id, eventoId: { not: null } },
      select: { eventoId: true },
    });
    const lancado = await db.eventoPartida.findFirst({
      where: { partidaId: partida.id, timeId, tipo: "GOL", id: { notIn: casados.map((c) => c.eventoId!) } },
      orderBy: { createdAt: "desc" },
    });
    if (lancado) {
      const sugestao = await db.golSugerido.create({ data: { ...dados, status: "CLIPE", eventoId: lancado.id } });
      if (!lancado.videoUrl) await db.eventoPartida.update({ where: { id: lancado.id }, data: { videoUrl: clipe } });
      revalidarPartida(tenantSlug, partida.id);
      revalidatePath(paths.admin.golsSugeridos(tenantSlug));
      return { resultado: "clipe" as const, id: sugestao.id };
    }
  }

  if (umAMais) {
    const minuto = minutoDeJogo(partida, Date.now() - ATRASO_DETECCAO_MS);
    const { sugestao, atual } = await db.$transaction(async (tx) => {
      const evento = await tx.eventoPartida.create({
        data: { tenantId: s.tenantId, partidaId: partida.id, tipo: "GOL", timeId, minuto, videoUrl: clipe },
      });
      const atual = await tx.partida.update({
        where: { id: partida.id },
        data: s.lado === "casa" ? { placarCasa: { increment: 1 } } : { placarFora: { increment: 1 } },
      });
      const sugestao = await tx.golSugerido.create({ data: { ...dados, status: "CLIPE", eventoId: evento.id } });
      return { sugestao, atual };
    });
    revalidarPartida(tenantSlug, partida.id);

    const placar = `${partida.timeCasa.nome} ${atual.placarCasa} x ${atual.placarFora} ${partida.timeFora.nome}`;
    await notifyPartidaEvento(s.tenantId, partida.id, { title: `Gol de ${timeNome}!`, body: placar });
    await notifyAdmins(s.tenantId, {
      title: `Gol de ${timeNome} lançado pela transmissão`,
      body: `${placar}. Toque para escolher quem fez ou ajustar o clipe.`,
      url: paths.admin.golSugerido(tenantSlug, sugestao.id),
    });
    return { resultado: "lancado" as const, id: sugestao.id };
  }

  const sugestao = await db.golSugerido.create({ data: dados });
  await notifyAdmins(s.tenantId, {
    title: `Gol de ${timeNome}?`,
    body: `A transmissão mostra ${partida.timeCasa.nome} ${s.placarCasa} x ${s.placarFora} ${partida.timeFora.nome}, diferente do site. Toque para conferir.`,
    url: paths.admin.golSugerido(tenantSlug, sugestao.id),
  });
  revalidatePath(paths.admin.partidaSumula(tenantSlug, partida.id));
  revalidatePath(paths.admin.golsSugeridos(tenantSlug));
  return { resultado: "pendente" as const, id: sugestao.id };
}

/**
 * O placar da live voltou um gol (o operador corrigiu): o gol que a
 * transmissão lançou sozinho sai da súmula. Se o admin já mexeu nele (aprovou
 * o clipe ou lançou o mesmo gol), fica e o admin é avisado para conferir.
 */
export async function desfazerGolAutomatico(s: Omit<Sugestao, "segundo">) {
  const db = getTenantPrisma(s.tenantId);
  const partida = await partidaDaLive(s.tenantId, s.videoId);
  if (!partida) return { resultado: "sem_partida" as const };

  const timeId = s.lado === "casa" ? partida.timeCasaId : partida.timeForaId;
  const tenantSlug = partida.tenant.slug;
  const sugestao = await db.golSugerido.findFirst({
    where: {
      partidaId: partida.id,
      timeId,
      eventoId: { not: null },
      status: { in: ["CLIPE", "APROVADO", "SEM_CLIPE"] },
      placarCasa: s.lado === "casa" ? s.placarCasa + 1 : s.placarCasa,
      placarFora: s.lado === "fora" ? s.placarFora + 1 : s.placarFora,
      createdAt: { gte: new Date(Date.now() - 2 * JANELA_GOL_MS) },
    },
    orderBy: { createdAt: "desc" },
  });
  if (!sugestao) return { resultado: "nada" as const };

  const evento = await db.eventoPartida.findUnique({ where: { id: sugestao.eventoId! } });
  const placarLive = `${partida.timeCasa.nome} ${s.placarCasa} x ${s.placarFora} ${partida.timeFora.nome}`;
  if (!evento || evento.lancadoPorId) {
    await notifyAdmins(s.tenantId, {
      title: "O placar da transmissão voltou um gol",
      body: `A live agora mostra ${placarLive}. Confira o gol na súmula.`,
      url: paths.admin.partidaSumula(tenantSlug, partida.id),
    });
    return { resultado: "avisado" as const };
  }

  await db.$transaction(async (tx) => {
    await tx.eventoPartida.delete({ where: { id: evento.id } });
    await tx.partida.update({
      where: { id: partida.id },
      data: s.lado === "casa" ? { placarCasa: { decrement: 1 } } : { placarFora: { decrement: 1 } },
    });
    await tx.golSugerido.update({
      where: { id: sugestao.id },
      data: { status: "DESCARTADO", eventoId: null, resolvidoEm: new Date() },
    });
  });
  revalidarPartida(tenantSlug, partida.id);
  await notifyAdmins(s.tenantId, {
    title: "Gol retirado da súmula",
    body: `O placar da transmissão voltou para ${placarLive}, e o gol lançado por ela saiu.`,
    url: paths.admin.partidaSumula(tenantSlug, partida.id),
  });
  return { resultado: "desfeito" as const };
}

/**
 * Gol lançado na mão pelo admin. Se a live já tinha mostrado esse gol:
 * - já lançado pela transmissão: o lance do admin fica (com o minuto e o autor
 *   dele) e o da transmissão sai, sem contar o gol duas vezes;
 * - pendente (placar diferente): vira o lance do admin, já com o clipe.
 * Devolve true quando o gol era repetido (o público já foi avisado).
 */
export async function casarGolLancado(tenantId: string, eventoId: string) {
  const db = getTenantPrisma(tenantId);
  const evento = await db.eventoPartida.findUnique({ where: { id: eventoId }, include: { partida: true } });
  if (!evento || evento.tipo !== "GOL") return false;
  const desde = new Date(Date.now() - JANELA_GOL_MS);

  // Gol da transmissão ainda não assumido pelo admin, e o placar do site agora
  // passou do que a live mostrou: é o mesmo gol lançado de novo.
  const ehCasa = evento.timeId === evento.partida.timeCasaId;
  const placarTime = ehCasa ? evento.partida.placarCasa : evento.partida.placarFora;
  const automaticos = await db.golSugerido.findMany({
    where: {
      partidaId: evento.partidaId,
      timeId: evento.timeId,
      eventoId: { not: null },
      status: { in: ["CLIPE", "APROVADO", "SEM_CLIPE"] },
      createdAt: { gte: desde },
    },
    orderBy: { createdAt: "asc" },
  });
  for (const auto of automaticos) {
    if (placarTime <= (ehCasa ? auto.placarCasa : auto.placarFora)) continue;
    const doMonitor = await db.eventoPartida.findUnique({ where: { id: auto.eventoId! } });
    if (!doMonitor || doMonitor.lancadoPorId || doMonitor.id === eventoId) continue;

    await db.$transaction(async (tx) => {
      await tx.eventoPartida.delete({ where: { id: doMonitor.id } });
      await tx.eventoPartida.update({
        where: { id: eventoId },
        data: {
          atletaId: evento.atletaId ?? doMonitor.atletaId,
          videoUrl: evento.videoUrl ?? doMonitor.videoUrl,
        },
      });
      await tx.partida.update({
        where: { id: evento.partidaId },
        data: ehCasa ? { placarCasa: { decrement: 1 } } : { placarFora: { decrement: 1 } },
      });
      await tx.golSugerido.update({ where: { id: auto.id }, data: { eventoId } });
    });
    return true;
  }

  const pendente = await db.golSugerido.findFirst({
    where: { partidaId: evento.partidaId, timeId: evento.timeId, status: "PENDENTE", createdAt: { gte: desde } },
    orderBy: { createdAt: "asc" },
  });
  if (pendente) {
    const { count } = await db.golSugerido.updateMany({
      where: { id: pendente.id, status: "PENDENTE" },
      data: { status: "CLIPE", eventoId },
    });
    const videoId = extrairYoutubeId(evento.partida.linkTransmissaoUrl);
    if (count === 1 && videoId && !evento.videoUrl) {
      await db.eventoPartida.update({
        where: { id: eventoId },
        data: { videoUrl: youtubeUrlNoSegundo(videoId, pendente.videoSegundo) },
      });
    }
  }
  return false;
}

type Db = ReturnType<typeof getTenantPrisma>;

type FiltroStatus = string | { not: string } | { in: string[] } | { notIn: string[] };

/**
 * Gols vistos na live com a partida, o elenco do time do gol (para escolher o
 * autor) e o autor já escolhido no lance, quando há.
 */
export async function buscarGolsSugeridos(db: Db, where: { id?: string; status?: FiltroStatus }, take = 30) {
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
  const [atletas, eventos] = await Promise.all([
    db.atleta.findMany({
      where: { timeId: { in: [...new Set(sugestoes.map((s) => s.timeId))] } },
      orderBy: { numero: "asc" },
      select: { id: true, nome: true, apelido: true, numero: true, timeId: true },
    }),
    db.eventoPartida.findMany({
      where: { id: { in: sugestoes.flatMap((s) => (s.eventoId ? [s.eventoId] : [])) } },
      select: { id: true, atletaId: true },
    }),
  ]);
  return sugestoes.map((sugestao) => ({
    sugestao,
    atletas: atletas.filter((a) => a.timeId === sugestao.timeId),
    autorId: eventos.find((e) => e.id === sugestao.eventoId)?.atletaId ?? null,
  }));
}
