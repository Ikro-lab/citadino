"use client";

import { useEffect, useState } from "react";
import { MatchHeader } from "@/components/partidas/match-header";
import { EventTimeline } from "@/components/partidas/event-timeline";
import { Roster } from "@/components/partidas/roster";
import type { PartidaDetalhe } from "@/lib/partidas";

export function LiveMatchDetail({ initial }: { initial: PartidaDetalhe }) {
  const [partida, setPartida] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);

  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setPartida(initial);
  }

  useEffect(() => {
    if (partida.status !== "AO_VIVO") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/partidas/${initial.id}`, { cache: "no-store" });
        if (res.ok) {
          setPartida(await res.json());
        }
      } catch {
        // ignore transient network errors, will retry on next tick
      }
    }, 6000);

    return () => clearInterval(interval);
  }, [partida.status, initial.id]);

  return (
    <div className="flex flex-col gap-4">
      <MatchHeader partida={partida} />
      <EventTimeline partida={partida} />
      <Roster partida={partida} />
    </div>
  );
}
