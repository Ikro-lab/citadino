"use client";

import { useState } from "react";
import { MatchHeader } from "@/components/partidas/match-header";
import { MatchTabs } from "@/components/partidas/match-tabs";
import { usePolling } from "@/lib/use-polling";
import type { AbaPartida } from "@/lib/labels";
import type { PartidaDetalhe } from "@/lib/partidas";
import type { LinhaClassificacao } from "@/lib/classificacao";

export function LiveMatchDetail({
  initial,
  linhasClassificacao,
  tenantSlug,
  abaInicial,
  timesEditaveis = [],
}: {
  initial: PartidaDetalhe;
  linhasClassificacao: LinhaClassificacao[];
  tenantSlug: string;
  abaInicial?: AbaPartida;
  timesEditaveis?: string[];
}) {
  const [partida, setPartida] = useState(initial);
  const [prevInitial, setPrevInitial] = useState(initial);

  if (initial !== prevInitial) {
    setPrevInitial(initial);
    setPartida(initial);
  }

  usePolling(
    async () => {
      try {
        const res = await fetch(`/api/${tenantSlug}/partidas/${initial.id}`);
        if (res.ok) {
          setPartida(await res.json());
        }
      } catch {
        // ignore transient network errors, will retry on next tick
      }
    },
    // Jogo atrasado pelos anteriores: confere de vez em quando se a previsão mudou ou se começou.
    partida.status === "AO_VIVO" ? 6000 : 30000,
    partida.status === "AO_VIVO" || Boolean(partida.previstoEm)
  );

  return (
    <div className="flex flex-col gap-4">
      <MatchHeader partida={partida} />
      <MatchTabs
        partida={partida}
        linhasClassificacao={linhasClassificacao}
        tenantSlug={tenantSlug}
        abaInicial={abaInicial}
        timesEditaveis={timesEditaveis}
      />
    </div>
  );
}
