"use client";

import { useEffect, useState } from "react";

function calcularMinuto(dataHora: string | Date) {
  const inicio = new Date(dataHora).getTime();
  return Math.max(0, Math.floor((Date.now() - inicio) / 60000));
}

export function LiveMinuto({ dataHora }: { dataHora: string | Date }) {
  const [minuto, setMinuto] = useState(() => calcularMinuto(dataHora));

  useEffect(() => {
    const interval = setInterval(() => setMinuto(calcularMinuto(dataHora)), 15000);
    return () => clearInterval(interval);
  }, [dataHora]);

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
