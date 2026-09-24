"use client";

import { useEffect, useRef, useState } from "react";
import { Play, RotateCcw, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { youtubeUrlNoSegundo } from "@/lib/youtube";

type YTPlayer = {
  seekTo(segundos: number, permitirBuffer: boolean): void;
  playVideo(): void;
  pauseVideo(): void;
  getCurrentTime(): number;
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

/**
 * Toca só o trecho do lance (início → fim) de um vídeo do YouTube. Durante a
 * live o player embutido ignora `start/end` e vai para o ao vivo, então aqui
 * o player é controlado: volta ao segundo do lance e pausa no fim. Se o
 * YouTube não deixar voltar no tempo (live sem histórico), mostra o aviso.
 */
export function YoutubeClipe({
  videoId,
  inicio,
  fim,
  className,
}: {
  videoId: string;
  inicio: number;
  fim: number;
  className?: string;
}) {
  const [estado, setEstado] = useState<Estado>("capa");
  const alvoRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      playerRef.current?.destroy();
    },
    []
  );

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
    if (!alvoRef.current) return;
    const div = document.createElement("div");
    alvoRef.current.replaceChildren(div);

    playerRef.current = new YT.Player(div, {
      videoId,
      host: "https://www.youtube-nocookie.com",
      playerVars: { start: inicio, end: fim, autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 },
      events: {
        onReady: (e) => {
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

  if (estado === "indisponivel") {
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

      {estado === "capa" && (
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

      {estado === "fim" && (
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
