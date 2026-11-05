import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EventoVideo } from "@/components/partidas/evento-video";
import { CompartilharGol } from "@/components/partidas/compartilhar-gol";
import { acaoLinkClass } from "@/components/partidas/partida-list-item";
import { nomeDoAtleta } from "@/lib/labels";
import { extrairYoutubeId } from "@/lib/youtube";
import { paths } from "@/lib/tenant-path";

type Params = Promise<{ tenant: string; id: string }>;

/** Gol com o placar daquele momento (pela ordem dos lances) e o texto do link. */
const getGol = cache(async (tenantSlug: string, id: string) => {
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);
  const gol = await db.eventoPartida.findUnique({
    where: { id },
    include: {
      atleta: { select: { id: true, nome: true, apelido: true, numero: true } },
      partida: {
        include: {
          categoria: { select: { nome: true } },
          timeCasa: { select: { id: true, nome: true } },
          timeFora: { select: { id: true, nome: true } },
          eventos: { where: { tipo: "GOL" }, select: { id: true, timeId: true }, orderBy: [{ minuto: "asc" }, { createdAt: "asc" }] },
        },
      },
    },
  });
  if (!gol || gol.tipo !== "GOL") return null;

  const { partida } = gol;
  const ate = partida.eventos.slice(0, partida.eventos.findIndex((e) => e.id === gol.id) + 1);
  const placarCasa = ate.filter((e) => e.timeId === partida.timeCasa.id).length;
  const placarFora = ate.length - placarCasa;
  const time = gol.timeId === partida.timeCasa.id ? partida.timeCasa : partida.timeFora;
  const autor = gol.atleta ? `${nomeDoAtleta(gol.atleta)} (${time.nome})` : time.nome;
  const placar = `${partida.timeCasa.nome} ${placarCasa} x ${placarFora} ${partida.timeFora.nome}`;
  return { tenant, gol, partida, time, placar, texto: `Gol de ${autor}! ${placar}` };
});

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { tenant: tenantSlug, id } = await params;
  const dados = await getGol(tenantSlug, id);
  if (!dados) return {};
  const videoId = extrairYoutubeId(dados.gol.videoUrl);
  const descricao = `${dados.partida.categoria.nome}, ${dados.gol.minuto}'. Veja o lance no app do ${dados.tenant.nome}.`;
  return {
    title: dados.texto,
    description: descricao,
    openGraph: {
      title: dados.texto,
      description: descricao,
      // Prévia no WhatsApp: a imagem da transmissão.
      images: videoId ? [`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`] : undefined,
    },
  };
}

export default async function GolPage({ params }: { params: Params }) {
  const { tenant: tenantSlug, id } = await params;
  const dados = await getGol(tenantSlug, id);
  if (!dados) notFound();
  const { gol, partida, time, placar, texto } = dados;

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4 px-4 py-6">
      <Card>
        <div className="mb-3 flex items-center justify-between gap-2">
          <Badge variant="accent">{partida.categoria.nome}</Badge>
          <span className="text-sm font-semibold text-muted tabular-nums">{gol.minuto}&apos;</span>
        </div>
        <h1 className="text-2xl font-semibold leading-tight">
          Gol de{" "}
          {gol.atleta ? (
            <Link href={paths.atleta(tenantSlug, gol.atleta.id)} className="hover:text-accent hover:underline">
              {nomeDoAtleta(gol.atleta)}
            </Link>
          ) : (
            time.nome
          )}
          !
        </h1>
        {gol.atleta && (
          <p className="text-sm text-muted">
            #{gol.atleta.numero}, {time.nome}
          </p>
        )}
        <p className="mt-2 font-display text-xl font-bold tabular-nums">{placar}</p>

        {gol.videoUrl ? (
          <EventoVideo url={gol.videoUrl} className="mt-4 aspect-video w-full rounded-xl bg-black" />
        ) : (
          <p className="mt-4 text-sm text-muted">O vídeo deste gol ainda não está disponível.</p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link href={paths.partida(tenantSlug, partida.id)} className={acaoLinkClass}>
            Ver a partida
          </Link>
          <CompartilharGol caminho={paths.gol(tenantSlug, gol.id)} texto={texto} />
        </div>
      </Card>
    </div>
  );
}
