"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, ExternalLink, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { youtubeUrlNoSegundo } from "@/lib/youtube";

type YTPlayer = {
  seekTo(segundos: number, permitirBuffer: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
  mute(): void;
  unMute(): void;
  destroy(): void;
};

type YTNamespace = {
  Player: new (
    el: HTMLElement,
    opts: {
      videoId: string;
      host?: string;
      playerVars?: Record<string, number | string>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: { data: number; target: YTPlayer }) => void;
      };
    }
  ) => YTPlayer;
  PlayerState: { PLAYING: number };
};

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let apiPromise: Promise<YTNamespace> | null = null;

function carregarApiYoutube(): Promise<YTNamespace> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  apiPromise ??= new Promise((resolve) => {
    const anterior = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      anterior?.();
      resolve(window.YT!);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    s.async = true;
    document.head.appendChild(s);
  });
  return apiPromise;
}

type Estado = "capa" | "tocando" | "fim" | "indisponivel";

// Feed de gols: o som escolhido vale para os próximos vídeos da rolagem.
let somLigadoNoFeed = false;

/**
 * Toca só o trecho do lance (início → fim) de um vídeo do YouTube. Durante a
 * live o player embutido ignora `start/end` e vai para o ao vivo, então aqui
 * o player é controlado: volta ao segundo do lance e pausa no fim. Se o
 * YouTube não deixar voltar no tempo (live sem histórico), mostra o aviso.
 *
 * Com `ativo` (feed de gols), toca sozinho e sem som enquanto estiver na tela,
 * repete o lance e libera o player quando sai dela.
 */
export function YoutubeClipe({
  videoId,
  inicio,
  fim,
  className,
  ativo,
}: {
  videoId: string;
  inicio: number;
  fim: number;
  className?: string;
  ativo?: boolean;
}) {
  const automatico = ativo !== undefined;
  const [estado, setEstado] = useState<Estado>("capa");
  const [som, setSom] = useState(somLigadoNoFeed);
  const alvoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const timerRef = useRef<number | null>(null);
  const ativoRef = useRef(ativo);
  ativoRef.current = ativo;

  function liberar() {
    if (timerRef.current) window.clearInterval(timerRef.current);
    timerRef.current = null;
    playerRef.current?.destroy();
    playerRef.current = null;
    alvoRef.current?.replaceChildren();
  }

  useEffect(() => liberar, []);

  // Feed: entra na tela, toca; sai, libera (dezenas de iframes travam o celular).
  useEffect(() => {
    if (!automatico) return;
    if (ativo) {
      tocar();
    } else {
      liberar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo]);

  function alternarSom() {
    const ligar = !som;
    somLigadoNoFeed = ligar;
    setSom(ligar);
    if (ligar) playerRef.current?.unMute();
    else playerRef.current?.mute();
  }

  function vigiar(player: YTPlayer) {
    if (timerRef.current) window.clearInterval(timerRef.current);
    let checagens = 0;
    let tentouDeNovo = false;
    timerRef.current = window.setInterval(() => {
      const t = player.getCurrentTime();
      checagens++;

      // Muito longe do trecho = o player ficou no ao vivo.
      const foraDoTrecho = t < inicio - 5 || t > fim + 15;
      if (foraDoTrecho && checagens >= 3) {
        if (!tentouDeNovo) {
          tentouDeNovo = true;
          player.seekTo(inicio, true);
          checagens = 0;
          return;
        }
        window.clearInterval(timerRef.current!);
        player.destroy();
        playerRef.current = null;
        setEstado("indisponivel");
        return;
      }

      if (t >= fim) {
        if (automatico && ativoRef.current) {
          player.seekTo(inicio, true);
          return;
        }
        player.pauseVideo();
        window.clearInterval(timerRef.current!);
        setEstado("fim");
      }
    }, 400);
  }

  async function tocar() {
    if (playerRef.current) {
      playerRef.current.seekTo(inicio, true);
      playerRef.current.playVideo();
      setEstado("tocando");
      vigiar(playerRef.current);
      return;
    }

    setEstado("tocando");
    const YT = await carregarApiYoutube();
    if (!alvoRef.current || playerRef.current) return;
    // Rolou para o próximo antes de a API carregar.
    if (automatico && !ativoRef.current) return;
    const div = document.createElement("div");
    alvoRef.current.replaceChildren(div);

    playerRef.current = new YT.Player(div, {
      videoId,
      host: "https://www.youtube-nocookie.com",
      playerVars: {
        start: inicio,
        end: fim,
        autoplay: 1,
        playsinline: 1,
        rel: 0,
        modestbranding: 1,
        // Celular só deixa tocar sozinho sem som.
        mute: automatico && !somLigadoNoFeed ? 1 : 0,
        ...(automatico ? { controls: 0, disablekb: 1, fs: 0 } : {}),
      },
      events: {
        onReady: (e) => {
          if (automatico && somLigadoNoFeed) e.target.unMute();
          e.target.seekTo(inicio, true);
          e.target.playVideo();
        },
        onStateChange: (e) => {
          if (e.data === YT.PlayerState.PLAYING) vigiar(e.target);
        },
      },
    });
  }

  const base = cn("relative overflow-hidden", className);
  // Fora da tela, no feed, o player foi liberado: volta para a capa.
  const visivel: Estado = automatico && !ativo && estado !== "indisponivel" ? "capa" : estado;

  if (visivel === "indisponivel") {
    return (
      <div className={cn(base, "flex flex-col items-center justify-center gap-3 p-4 text-center text-white")}>
        <p className="text-sm">O replay deste lance fica disponível quando a transmissão terminar.</p>
        <a
          href={youtubeUrlNoSegundo(videoId, inicio)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-white/15 px-3 text-sm font-semibold hover:bg-white/25"
        >
          <ExternalLink size={16} />
          Ver no YouTube
        </a>
      </div>
    );
  }

  return (
    <div className={base}>
      <div ref={alvoRef} className="absolute inset-0 [&>iframe]:h-full [&>iframe]:w-full" />

      {automatico && visivel === "tocando" && (
        <button
          type="button"
          onClick={alternarSom}
          aria-label={som ? "Tirar o som" : "Ligar o som"}
          className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
        >
          {som ? <Volume2 size={20} /> : <VolumeX size={20} />}
        </button>
      )}

      {visivel === "capa" && (
        <button
          type="button"
          onClick={tocar}
          aria-label="Assistir ao lance"
          className="absolute inset-0 flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(https://i.ytimg.com/vi/${videoId}/hqdefault.jpg)` }}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-black/70 text-white">
            <Play size={26} className="ml-1" fill="currentColor" />
          </span>
        </button>
      )}

      {visivel === "fim" && (
        <button
          type="button"
          onClick={tocar}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 text-sm font-semibold text-white"
        >
          <RotateCcw size={26} />
          Rever lance
        </button>
      )}
    </div>
  );
}
