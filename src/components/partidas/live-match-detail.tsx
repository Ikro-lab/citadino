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
}: {
  initial: PartidaDetalhe;
  linhasClassificacao: LinhaClassificacao[];
  tenantSlug: string;
  abaInicial?: AbaPartida;
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
    6000,
    partida.status === "AO_VIVO"
  );

  return (
    <div className="flex flex-col gap-4">
      <MatchHeader partida={partida} />
      <MatchTabs
        partida={partida}
        linhasClassificacao={linhasClassificacao}
        tenantSlug={tenantSlug}
        abaInicial={abaInicial}
      />
    </div>
  );
}
