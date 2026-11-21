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

/** Partidas ao vivo com live, e as de hoje ainda agendadas com live (o monitor reconhece pelos nomes na tela). */
export async function partidasParaMonitor(tenantId: string) {
  const db = getTenantPrisma(tenantId);
  const { start, end } = dayRange(todayStr());
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
  const { start, end } = dayRange(todayStr());
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

/** Antes disso desde o início do jogo, um "2T" na tela é leitura errada. */
const PRIMEIRO_TEMPO_MINIMO_MS = 8 * 60_000;

/**
 * O monitor viu "2T" no placar da transmissão: marca o início do 2º tempo e,
 * se a mesa não marcou, o fim do 1º. `segundoTempoEm` vem do cronômetro da
 * tela (momento do quadro menos o tempo mostrado); `intervaloEm`, do último
 * quadro com o 1º tempo correndo (sem ele, o intervalo fica no mesmo instante).
 * Se a mesa já marcou o 2º tempo, não mexe.
 */
export async function marcarSegundoTempoPelaTela(
  tenantId: string,
  t: { partidaId: string; segundoTempoEm: Date; intervaloEm: Date | null }
) {
  const db = getTenantPrisma(tenantId);
  const partida = await db.partida.findUnique({
    where: { id: t.partidaId },
    include: { timeCasa: true, timeFora: true, tenant: { select: { slug: true } } },
  });
  if (!partida || partida.status !== "AO_VIVO" || !partida.iniciadaEm) return { erro: "partida não está ao vivo" as const };
  if (partida.segundoTempoEm) return { resultado: "ja_marcado" as const };

  const inicio = partida.iniciadaEm.getTime();
  const segundo = Math.min(t.segundoTempoEm.getTime(), Date.now());
  if (segundo - inicio < PRIMEIRO_TEMPO_MINIMO_MS) return { erro: "cedo demais para o 2º tempo" as const };
  const intervalo = Math.max(inicio, Math.min(partida.intervaloEm?.getTime() ?? t.intervaloEm?.getTime() ?? segundo, segundo));

  const { count } = await db.partida.updateMany({
    where: { id: partida.id, status: "AO_VIVO", segundoTempoEm: null },
    data: { intervaloEm: new Date(intervalo), segundoTempoEm: new Date(segundo) },
  });
  if (count !== 1) return { resultado: "ja_marcado" as const };

  const slug = partida.tenant.slug;
  revalidatePath(paths.admin.partidaSumula(slug, partida.id));
  revalidatePath(paths.partida(slug, partida.id));
  revalidatePath(paths.home(slug));
  const placar = `${partida.timeCasa.nome} ${partida.placarCasa} x ${partida.placarFora} ${partida.timeFora.nome}`;
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
