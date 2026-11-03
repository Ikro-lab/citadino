"use client";

import { useEffect, useState } from "react";

function calcularMinuto(inicio: string | Date) {
  return Math.max(0, Math.floor((Date.now() - new Date(inicio).getTime()) / 60000));
}

/** `inicio`: use `inicioDoJogo(partida)` (o toque em "Iniciar partida", ou o horário marcado). */
export function LiveMinuto({ inicio }: { inicio: string | Date }) {
  const [minuto, setMinuto] = useState(() => calcularMinuto(inicio));

  useEffect(() => {
    const interval = setInterval(() => setMinuto(calcularMinuto(inicio)), 15000);
    return () => clearInterval(interval);
  }, [inicio]);

  return (
    <span
      suppressHydrationWarning
      className="flex flex-col items-center gap-1 text-xs font-semibold text-live tabular-nums"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-live animate-pulse-live" />
      {minuto <= 120 ? `${minuto}'` : "Ao vivo"}
    </span>
  );
}
