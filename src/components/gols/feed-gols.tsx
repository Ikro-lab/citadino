"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Heart, Share2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { paths } from "@/lib/tenant-path";
import { extrairYoutubeId } from "@/lib/youtube";
import { EventoVideo } from "@/components/partidas/evento-video";
import { alternarCurtida, carregarMaisGols } from "@/lib/actions/curtidas";
import { MULTIPLICADOR_CURTIDAS } from "@/lib/curtidas";
import type { GolDoFeed, OrdemFeed } from "@/lib/feed-gols";

const formatarCurtidas = (n: number) =>
  n >= 1000 ? `${(n / 1000).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} mil` : String(n);

/**
 * Feed de gols em vídeo, um por tela, rolando para cima como nos apps de
 * vídeo curto. Só o gol que está na tela tem player (os outros ficam na capa).
 */
export function FeedGols({
  tenantSlug,
  ordem,
  golsIniciais,
  temMaisInicial,
}: {
  tenantSlug: string;
  ordem: OrdemFeed;
  golsIniciais: GolDoFeed[];
  temMaisInicial: boolean;
}) {
  const [gols, setGols] = useState(golsIniciais);
  const [temMais, setTemMais] = useState(temMaisInicial);
  const [ativo, setAtivo] = useState(0);
  const [carregando, startCarregar] = useTransition();
  const rolagemRef = useRef<HTMLDivElement>(null);

  // O gol que ocupa a maior parte da tela é o que toca.
  useEffect(() => {
    const raiz = rolagemRef.current;
    if (!raiz) return;
    const obs = new IntersectionObserver(
      (entradas) => {
        for (const e of entradas) {
          if (e.isIntersecting) setAtivo(Number((e.target as HTMLElement).dataset.indice));
        }
      },
      { root: raiz, threshold: 0.6 }
    );
    raiz.querySelectorAll("[data-indice]").forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [gols.length]);

  // Busca o próximo pedaço antes de chegar ao fim.
  useEffect(() => {
    if (!temMais || carregando || ativo < gols.length - 3) return;
    startCarregar(async () => {
      const r = await carregarMaisGols(tenantSlug, ordem, gols.length);
      setGols((atual) => {
        const vistos = new Set(atual.map((g) => g.id));
        return [...atual, ...r.gols.filter((g) => !vistos.has(g.id))];
      });
      setTemMais(r.temMais);
    });
  }, [ativo, gols.length, temMais, carregando, tenantSlug, ordem]);

  const atualizar = useCallback((id: string, dados: Partial<GolDoFeed>) => {
    setGols((atual) => atual.map((g) => (g.id === id ? { ...g, ...dados } : g)));
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-[35] bg-black text-white md:bottom-0">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between gap-2 bg-gradient-to-b from-black/70 to-transparent px-3 pb-6 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <Link
          href={paths.home(tenantSlug)}
          aria-label="Voltar"
          className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10"
        >
          <ArrowLeft size={22} />
        </Link>
        <nav className="pointer-events-auto flex gap-1 rounded-full bg-black/40 p-1 text-sm font-semibold">
          <AbaOrdem href={paths.gols(tenantSlug)} ativa={ordem === "recentes"}>
            Recentes
          </AbaOrdem>
          <AbaOrdem href={paths.gols(tenantSlug, "curtidos")} ativa={ordem === "curtidos"}>
            Mais curtidos
          </AbaOrdem>
        </nav>
        <span className="w-10" />
      </div>

      <div ref={rolagemRef} className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none]">
        {gols.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <Trophy size={32} className="text-white/60" />
            <p className="font-semibold">Ainda não tem gol em vídeo.</p>
            <p className="text-sm text-white/70">Os gols aparecem aqui assim que entrarem com o vídeo do lance.</p>
          </div>
        )}
        {gols.map((gol, i) => (
          <ItemGol
            key={gol.id}
            gol={gol}
            indice={i}
            ativo={i === ativo}
            perto={Math.abs(i - ativo) <= 1}
            posicao={ordem === "curtidos" ? i + 1 : null}
            tenantSlug={tenantSlug}
            onAtualizar={atualizar}
          />
        ))}
        {gols.length > 0 && !temMais && (
          <div className="flex h-24 snap-end items-center justify-center text-sm text-white/60">
            Você viu todos os gols.
          </div>
        )}
      </div>
    </div>
  );
}

function AbaOrdem({ href, ativa, children }: { href: string; ativa: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      replace
      aria-current={ativa ? "page" : undefined}
      className={cn("rounded-full px-3 py-1.5", ativa ? "bg-white text-black" : "text-white/80 hover:text-white")}
    >
      {children}
    </Link>
  );
}

function ItemGol({
  gol,
  indice,
  ativo,
  perto,
  posicao,
  tenantSlug,
  onAtualizar,
}: {
  gol: GolDoFeed;
  indice: number;
  ativo: boolean;
  perto: boolean;
  posicao: number | null;
  tenantSlug: string;
  onAtualizar: (id: string, dados: Partial<GolDoFeed>) => void;
}) {
  const [coracao, setCoracao] = useState(false);
  const enviandoRef = useRef(false);
  const videoId = extrairYoutubeId(gol.videoUrl);
  const capa = videoId ? `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)` : undefined;
  const texto = `Gol de ${gol.autor ? `${gol.autor} (${gol.time})` : gol.time}! ${gol.timeCasa} ${gol.placarCasa} x ${gol.placarFora} ${gol.timeFora}`;

  async function curtir(forcar?: boolean) {
    if (forcar && gol.curtido) return;
    if (enviandoRef.current) return;
    enviandoRef.current = true;
    // Mostra na hora; o servidor confirma o total.
    const antes = { curtido: gol.curtido, curtidas: gol.curtidas };
    onAtualizar(gol.id, { curtido: !antes.curtido, curtidas: Math.max(0, antes.curtidas + (antes.curtido ? -1 : 1) * MULTIPLICADOR_CURTIDAS) });
    try {
      const r = await alternarCurtida(gol.id);
      onAtualizar(gol.id, "error" in r ? antes : r);
    } catch {
      onAtualizar(gol.id, antes);
    } finally {
      enviandoRef.current = false;
    }
  }

  // Dois toques fora do vídeo curtem, como nos apps de vídeo.
  function doisToques() {
    setCoracao(true);
    setTimeout(() => setCoracao(false), 700);
    curtir(true);
  }

  async function compartilhar() {
    const url = new URL(paths.gol(tenantSlug, gol.id), window.location.origin).toString();
    if (navigator.share) {
      await navigator.share({ title: texto, text: texto, url }).catch(() => {});
      return;
    }
    await navigator.clipboard?.writeText(`${texto} ${url}`).catch(() => {});
  }

  return (
    <section
      data-indice={indice}
      onDoubleClick={doisToques}
      className="relative flex h-full snap-start snap-always items-center justify-center overflow-hidden"
    >
      {/* Fundo: a própria imagem do lance, borrada, para não ficar só tarja preta. */}
      {capa && perto && (
        <div aria-hidden className="absolute inset-0 scale-110 bg-cover bg-center opacity-40 blur-2xl" style={{ backgroundImage: capa }} />
      )}

      <div className="relative w-full max-w-3xl" onDoubleClick={(e) => e.stopPropagation()}>
        {perto ? (
          <EventoVideo url={gol.videoUrl} ativo={ativo} className="aspect-video w-full bg-black" />
        ) : (
          <div className="aspect-video w-full bg-black" />
        )}
      </div>

      {coracao && (
        <Heart
          aria-hidden
          size={96}
          fill="currentColor"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 animate-ping text-red-500"
        />
      )}

      <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-5 pt-16">
        <div className="min-w-0 flex-1">
          {posicao !== null && (
            <span className="mb-1 inline-block rounded-full bg-white/15 px-2 py-0.5 text-xs font-semibold">#{posicao} mais curtido</span>
          )}
          <h2 className="text-lg font-bold leading-tight">
            Gol de{" "}
            {gol.atletaId && gol.autor ? (
              <Link href={paths.atleta(tenantSlug, gol.atletaId)} className="hover:underline">
                {gol.autor}
              </Link>
            ) : (
              gol.time
            )}
            !
          </h2>
          {gol.autor && (
            <p className="text-sm text-white/80">
              {gol.numero !== null ? `#${gol.numero}, ` : ""}
              {gol.time}
            </p>
          )}
          <Link href={paths.partida(tenantSlug, gol.partidaId)} className="mt-1 block text-sm font-semibold tabular-nums hover:underline">
            {gol.timeCasa} {gol.placarCasa} x {gol.placarFora} {gol.timeFora}
          </Link>
          <p className="text-xs text-white/70">
            {gol.categoria} · {gol.minuto}&apos;
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-4">
          <button
            type="button"
            onClick={() => curtir()}
            aria-pressed={gol.curtido}
            aria-label={gol.curtido ? "Descurtir" : "Curtir"}
            className="flex flex-col items-center gap-0.5 text-xs font-semibold"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40">
              <Heart size={28} fill={gol.curtido ? "currentColor" : "none"} className={cn(gol.curtido && "text-red-500")} />
            </span>
            {formatarCurtidas(gol.curtidas)}
          </button>
          <button
            type="button"
            onClick={compartilhar}
            aria-label="Compartilhar"
            className="flex flex-col items-center gap-0.5 text-xs font-semibold"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/40">
              <Share2 size={24} />
            </span>
            Enviar
          </button>
        </div>
      </div>
    </section>
  );
}
