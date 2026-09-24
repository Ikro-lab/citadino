"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Escudo do time: a imagem cadastrada pelo organizador (escudoUrl) ou, na
 * falta dela — ou se o link quebrar —, as iniciais num círculo neutro.
 */
export function Escudo({
  nome,
  escudoUrl,
  size = 24,
  className,
}: {
  nome: string;
  escudoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  const [falhou, setFalhou] = useState(false);

  if (escudoUrl && !falhou) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={escudoUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        onError={() => setFalhou(true)}
        style={{ width: size, height: size }}
        className={cn("shrink-0 object-contain", className)}
      />
    );
  }

  return (
    <span
      aria-hidden
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.38) }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-border/70 font-bold text-muted",
        className
      )}
    >
      {nome.slice(0, 2).toUpperCase()}
    </span>
  );
}
