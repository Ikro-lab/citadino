"use client";

import { useEffect, useState } from "react";
import { MatchCard } from "@/components/partidas/match-card";
import type { FeedPartida } from "@/lib/partidas";

export function FeedList({
  initialPartidas,
  categoriaId,
  data,
}: {
  initialPartidas: FeedPartida[];
  categoriaId: string;
  data: string;
}) {
  const [partidas, setPartidas] = useState(initialPartidas);
  const [prevInitialPartidas, setPrevInitialPartidas] = useState(initialPartidas);

  if (initialPartidas !== prevInitialPartidas) {
    setPrevInitialPartidas(initialPartidas);
    setPartidas(initialPartidas);
  }

  const temAoVivo = partidas.some((p) => p.status === "AO_VIVO");

  useEffect(() => {
    if (!temAoVivo) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `/api/feed?${new URLSearchParams({ categoria: categoriaId, data }).toString()}`,
          { cache: "no-store" }
        );
        if (res.ok) {
          setPartidas(await res.json());
        }
      } catch {
        // ignore transient network errors, will retry on next tick
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [temAoVivo, categoriaId, data]);

  if (partidas.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
        Nenhuma partida agendada para este dia.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {partidas.map((partida) => (
        <MatchCard key={partida.id} partida={partida} />
      ))}
    </div>
  );
}
