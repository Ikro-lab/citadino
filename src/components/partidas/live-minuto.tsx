"use client";

import { useEffect, useState } from "react";
import { minutoDeJogo, tempoDeJogo } from "@/lib/escalacao";

type Relogio = Parameters<typeof minutoDeJogo>[0];

/**
 * Minuto ao vivo (conta do toque em "Iniciar partida" e para no intervalo).
 * `compacto`: coluna estreita do feed, sem o nome do tempo.
 */
export function LiveMinuto({ partida, compacto = false }: { partida: Relogio; compacto?: boolean }) {
  // Só força uma nova renderização a cada 15s; o minuto sai da conta com o relógio.
  const [, setTique] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTique((t) => t + 1), 15000);
    return () => clearInterval(interval);
  }, []);
  const minuto = minutoDeJogo(partida);
  const tempo = tempoDeJogo(partida);

  const texto =
    tempo === "INTERVALO"
      ? compacto
        ? "Int."
        : "Intervalo"
      : minuto > 120
        ? "Ao vivo"
        : compacto || !partida.intervaloEm
          ? `${minuto}'`
          : `${minuto}' · 2º tempo`;

  return (
    <span
      suppressHydrationWarning
      className="flex flex-col items-center gap-1 text-xs font-semibold text-live tabular-nums"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
      {texto}
    </span>
  );
}
