"use client";

import { useEffect, useRef } from "react";

/**
 * Chama `tick` a cada `intervalMs` enquanto `enabled` — mas só com a aba
 * visível. Em segundo plano (celular bloqueado, outro app) não faz requisição;
 * ao voltar, atualiza na hora. Economiza bateria/dados do torcedor e carga no
 * servidor durante jogo ao vivo.
 */
export function usePolling(tick: () => void | Promise<void>, intervalMs: number, enabled = true) {
  const tickRef = useRef(tick);
  useEffect(() => {
    tickRef.current = tick;
  });

  useEffect(() => {
    if (!enabled) return;

    let interval: ReturnType<typeof setInterval> | null = null;
    const start = () => {
      if (interval === null) interval = setInterval(() => void tickRef.current(), intervalMs);
    };
    const stop = () => {
      if (interval !== null) clearInterval(interval);
      interval = null;
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        void tickRef.current();
        start();
      } else {
        stop();
      }
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [intervalMs, enabled]);
}
