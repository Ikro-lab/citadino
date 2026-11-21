import "server-only";
import { revalidatePath } from "next/cache";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { notifyAdmins, notifyPartidaEvento } from "@/lib/push/notify";
import { paths } from "@/lib/tenant-path";
import { extrairYoutubeId } from "@/lib/youtube";
import { buscarInicioLiveYoutube } from "@/lib/youtube-live";
import { dayRange, todayStr } from "@/lib/date-utils";

/** Formato que o monitor recebe: o mesmo do GET /api/[tenant]/monitor. */
export type PartidaDoMonitor = {
  id: string;
  videoId: string;
  transmissaoInicioEm: Date | null;
  jogo: string;
};

const selecao = {
  id: true,
  linkTransmissaoUrl: true,
  transmissaoInicioEm: true,
  timeCasa: { select: { nome: true } },
  timeFora: { select: { nome: true } },
} as const;

function paraMonitor(p: {
  id: string;
  linkTransmissaoUrl: string | null;
  transmissaoInicioEm: Date | null;
  timeCasa: { nome: string };
  timeFora: { nome: string };
}): PartidaDoMonitor | null {
  const videoId = extrairYoutubeId(p.linkTransmissaoUrl);
  if (!videoId) return null;
  return { id: p.id, videoId, transmissaoInicioEm: p.transmissaoInicioEm, jogo: `${p.timeCasa.nome} x ${p.timeFora.nome}` };
}

/**
 * Janela dos jogos agendados que o monitor pode iniciar pela tela: os de hoje e
 * os das últimas horas. Rodada atrasada passa da meia-noite (20/11: renascer B x
 * Beco, marcado para 22:50, começou depois de 0h) e o jogo de ontem saía da lista.
 */
const ATRASO_MAXIMO_MS = 6 * 60 * 60_000;
function janelaDeHoje() {
  const { start, end } = dayRange(todayStr());
  return { start: new Date(Math.min(start.getTime(), Date.now() - ATRASO_MAXIMO_MS)), end };
}

/** Partidas ao vivo com live, e as de hoje (ou atrasadas de ontem) ainda agendadas com live. */
export async function partidasParaMonitor(tenantId: string) {
  const db = getTenantPrisma(tenantId);
  const { start, end } = janelaDeHoje();
  const [aoVivo, agendadas] = await Promise.all([
    db.partida.findMany({
      where: { status: "AO_VIVO", linkTransmissaoUrl: { not: null } },
      orderBy: { iniciadaEm: "desc" },
      select: selecao,
    }),
    db.partida.findMany({
      where: { status: "AGENDADA", linkTransmissaoUrl: { not: null }, dataHora: { gte: start, lte: end } },
      orderBy: { dataHora: "asc" },
      select: selecao,
    }),
  ]);
  const validas = (lista: typeof aoVivo) => lista.map(paraMonitor).filter((p): p is PartidaDoMonitor => !!p);
  return { partidas: validas(aoVivo), proximas: validas(agendadas) };
}

/**
 * O monitor viu na transmissão os times de outro jogo de hoje: encerra o jogo
 * que estava ao vivo nessa live (se houver) e inicia o que está na tela.
 * `placarNaTela` (casa x fora do jogo novo) só vai no aviso aos admins: gols
 * de antes da troca ficam para a mesa conferir.
 */
export async function trocarPartidaPelaTela(
  tenantId: string,
  t: { iniciarId: string; encerrarId: string | null; placarNaTela: [number, number] | null }
) {
  const db = getTenantPrisma(tenantId);
  const nova = await db.partida.findUnique({
    where: { id: t.iniciarId },
    include: { timeCasa: true, timeFora: true, tenant: { select: { slug: true } } },
  });
  const videoId = extrairYoutubeId(nova?.linkTransmissaoUrl ?? null);
  if (!nova || nova.status !== "AGENDADA" || !videoId) return { erro: "partida para iniciar inválida" as const };
  const { start, end } = janelaDeHoje();
  if (nova.dataHora < start || nova.dataHora > end) return { erro: "partida não é de hoje" as const };

  const antiga = t.encerrarId
    ? await db.partida.findUnique({ where: { id: t.encerrarId }, include: { timeCasa: true, timeFora: true } })
    : null;
  if (t.encerrarId && (!antiga || antiga.status !== "AO_VIVO" || extrairYoutubeId(antiga.linkTransmissaoUrl) !== videoId)) {
    return { erro: "partida para encerrar inválida" as const };
  }

  // Só um troca: dois envios seguidos não iniciam o jogo duas vezes.
  const { count } = await db.partida.updateMany({
    where: { id: nova.id, status: "AGENDADA" },
    data: {
      status: "AO_VIVO",
      iniciadaEm: new Date(),
      intervaloEm: null,
      segundoTempoEm: null,
      // Mesma live do jogo anterior: o início dela já é conhecido.
      transmissaoInicioEm: nova.transmissaoInicioEm ?? antiga?.transmissaoInicioEm ?? null,
    },
  });
  if (count !== 1) return { erro: "partida já iniciada" as const };
  if (antiga) await db.partida.updateMany({ where: { id: antiga.id, status: "AO_VIVO" }, data: { status: "ENCERRADA" } });

  let inicioLive = nova.transmissaoInicioEm ?? antiga?.transmissaoInicioEm ?? null;
  if (!inicioLive) {
    inicioLive = await buscarInicioLiveYoutube(videoId);
    if (inicioLive) await db.partida.update({ where: { id: nova.id }, data: { transmissaoInicioEm: inicioLive } });
  }

  const slug = nova.tenant.slug;
  for (const id of [nova.id, antiga?.id].filter((x): x is string => !!x)) {
    revalidatePath(paths.admin.partidaSumula(slug, id));
    revalidatePath(paths.partida(slug, id));
  }
  revalidatePath(paths.home(slug));
  revalidatePath(paths.classificacao(slug));

  const jogoNovo = `${nova.timeCasa.nome} x ${nova.timeFora.nome}`;
  if (antiga) {
    await notifyPartidaEvento(tenantId, antiga.id, {
      title: `Fim de jogo: ${antiga.timeCasa.nome} ${antiga.placarCasa} x ${antiga.placarFora} ${antiga.timeFora.nome}`,
      body: "Confira os detalhes da partida.",
    });
  }
  await notifyPartidaEvento(tenantId, nova.id, { title: `Começou! ${jogoNovo}`, body: "A partida está ao vivo." });

  const placar = t.placarNaTela && (t.placarNaTela[0] > 0 || t.placarNaTela[1] > 0) ? t.placarNaTela : null;
  await notifyAdmins(tenantId, {
    title: `Live mudou de jogo: ${jogoNovo}`,
    body: [
      antiga
        ? `${antiga.timeCasa.nome} x ${antiga.timeFora.nome} encerrado com ${antiga.placarCasa} x ${antiga.placarFora}.`
        : null,
      `${jogoNovo} iniciado pela transmissão.`,
      placar ? `A tela já mostrava ${placar[0]} x ${placar[1]}: lance esses gols na súmula.` : null,
      "Confira as súmulas.",
    ]
      .filter(Boolean)
      .join(" "),
    url: paths.admin.partidaSumula(slug, nova.id),
  });

  const atualizada = await db.partida.findUniqueOrThrow({ where: { id: nova.id }, select: selecao });
  return { partida: paraMonitor(atualizada) };
}

/** Antes disso desde o início do jogo, "INTERVALO" ou "2T" na tela é leitura errada. */
const PRIMEIRO_TEMPO_MINIMO_MS = 8 * 60_000;
/** Antes disso desde o início do jogo, "FIM DE JOGO" na tela é leitura errada. */
const JOGO_MINIMO_MS = 20 * 60_000;

export type FaseNaTela = "INTERVALO" | "SEGUNDO_TEMPO" | "FIM";

/**
 * O monitor viu na transmissão uma mudança de fase do jogo:
 * - INTERVALO: faixa "INTERVALO" embaixo da tela; marca o fim do 1º tempo.
 * - SEGUNDO_TEMPO: "2T" no placar; marca o início do 2º tempo (pelo cronômetro
 *   da tela) e, se a mesa não marcou, o intervalo (último quadro do 1º tempo).
 * - FIM: faixa "FIM DE JOGO"; encerra a partida, a não ser que o placar da
 *   faixa seja diferente do site (aí só avisa os admins).
 * O que a mesa já marcou fica como está.
 */
export async function marcarTempoPelaTela(
  tenantId: string,
  t: { partidaId: string; fase: FaseNaTela; em: Date; intervaloEm: Date | null; placarNaTela: [number, number] | null }
) {
  const db = getTenantPrisma(tenantId);
  const partida = await db.partida.findUnique({
    where: { id: t.partidaId },
    include: { timeCasa: true, timeFora: true, tenant: { select: { slug: true } } },
  });
  if (!partida || partida.status !== "AO_VIVO" || !partida.iniciadaEm) return { erro: "partida não está ao vivo" as const };

  const inicio = partida.iniciadaEm.getTime();
  const em = Math.min(t.em.getTime(), Date.now());
  const slug = partida.tenant.slug;
  const placar = `${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`;
  const revalidar = () => {
    revalidatePath(paths.admin.partidaSumula(slug, partida.id));
    revalidatePath(paths.partida(slug, partida.id));
    revalidatePath(paths.home(slug));
  };

  if (t.fase === "INTERVALO") {
    if (partida.intervaloEm || partida.segundoTempoEm) return { resultado: "ja_marcado" as const };
    if (em - inicio < PRIMEIRO_TEMPO_MINIMO_MS) return { erro: "cedo demais para o intervalo" as const };
    const { count } = await db.partida.updateMany({
      where: { id: partida.id, status: "AO_VIVO", intervaloEm: null, segundoTempoEm: null },
      data: { intervaloEm: new Date(em) },
    });
    if (count !== 1) return { resultado: "ja_marcado" as const };
    revalidar();
    await notifyPartidaEvento(tenantId, partida.id, { title: `Intervalo: ${placar}`, body: "Fim do 1º tempo." });
    return { resultado: "marcado" as const };
  }

  if (t.fase === "SEGUNDO_TEMPO") {
    if (partida.segundoTempoEm) return { resultado: "ja_marcado" as const };
    if (em - inicio < PRIMEIRO_TEMPO_MINIMO_MS) return { erro: "cedo demais para o 2º tempo" as const };
    const intervalo = Math.max(inicio, Math.min(partida.intervaloEm?.getTime() ?? t.intervaloEm?.getTime() ?? em, em));
    const { count } = await db.partida.updateMany({
      where: { id: partida.id, status: "AO_VIVO", segundoTempoEm: null },
      data: { intervaloEm: new Date(intervalo), segundoTempoEm: new Date(em) },
    });
    if (count !== 1) return { resultado: "ja_marcado" as const };
    revalidar();
    await notifyPartidaEvento(tenantId, partida.id, {
      title: `Começou o 2º tempo: ${partida.timeCasa.nome} x ${partida.timeFora.nome}`,
      body: placar,
    });
    await notifyAdmins(tenantId, {
      title: "2º tempo marcado pela transmissão",
      body: `${placar}. O monitor viu "2T" no placar da live. Confira na súmula.`,
      url: paths.admin.partidaSumula(slug, partida.id),
    });
    return { resultado: "marcado" as const };
  }

  // FIM
  if (em - inicio < JOGO_MINIMO_MS) return { erro: "cedo demais para o fim de jogo" as const };
  const tela = t.placarNaTela;
  if (tela && (tela[0] !== partida.placarCasa || tela[1] !== partida.placarFora)) {
    await notifyAdmins(tenantId, {
      title: "Fim de jogo na transmissão, placar diferente",
      body: `A live mostra FIM DE JOGO com ${partida.timeCasa.nome} ${tela[0]} x ${tela[1]} ${partida.timeFora.nome}, e o site está ${partida.placarCasa} x ${partida.placarFora}. Acerte a súmula e encerre o jogo.`,
      url: paths.admin.partidaSumula(slug, partida.id),
    });
    return { erro: "placar da tela diferente do site" as const };
  }
  const { count } = await db.partida.updateMany({
    where: { id: partida.id, status: "AO_VIVO" },
    data: { status: "ENCERRADA" },
  });
  if (count !== 1) return { resultado: "ja_marcado" as const };
  revalidar();
  revalidatePath(paths.classificacao(slug));
  await notifyPartidaEvento(tenantId, partida.id, { title: `Fim de jogo: ${placar}`, body: "Confira os detalhes da partida." });
  await notifyAdmins(tenantId, {
    title: "Jogo encerrado pela transmissão",
    body: `${placar}. O monitor viu FIM DE JOGO na live. Confira a súmula.`,
    url: paths.admin.partidaSumula(slug, partida.id),
  });
  return { resultado: "encerrado" as const };
}
