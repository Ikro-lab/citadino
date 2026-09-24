"use client";

import { Fragment, useState } from "react";
import { FeedGroup } from "@/components/partidas/feed-group";
import { MatchRow } from "@/components/partidas/match-row";
import { SponsorFeedCard } from "@/components/patrocinadores/sponsor-feed-card";
import { EmptyState } from "@/components/ui/empty-state";
import { usePolling } from "@/lib/use-polling";
import type { FeedGrupo } from "@/lib/partidas";
import type { Patrocinador } from "@prisma/client";

type Forma = Record<string, ("V" | "E" | "D")[]>;

export function FeedList({
  initialGrupos,
  initialForma,
  data,
  vivo,
  patrocinadores = [],
  tenantSlug,
}: {
  initialGrupos: FeedGrupo[];
  initialForma: Forma;
  data: string;
  vivo: boolean;
  patrocinadores?: Patrocinador[];
  tenantSlug: string;
}) {
  const [grupos, setGrupos] = useState(initialGrupos);
  const [forma, setForma] = useState(initialForma);
  const [prevInitialGrupos, setPrevInitialGrupos] = useState(initialGrupos);

  if (initialGrupos !== prevInitialGrupos) {
    setPrevInitialGrupos(initialGrupos);
    setGrupos(initialGrupos);
    setForma(initialForma);
  }

  const temAoVivo = grupos.some((g) => g.partidas.some((p) => p.status === "AO_VIVO"));

  usePolling(
    async () => {
      try {
        const params = new URLSearchParams({ data });
        if (vivo) params.set("vivo", "1");
        const res = await fetch(`/api/${tenantSlug}/feed?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setGrupos(json.grupos);
          setForma(json.forma);
        }
      } catch {
        // ignore transient network errors, will retry on next tick
      }
    },
    8000,
    temAoVivo
  );

  if (grupos.length === 0) {
    return (
      <EmptyState>
        {vivo
          ? "Nenhuma partida ao vivo agora. Toque em “Todos” para ver os jogos do dia."
          : "Nenhuma partida neste dia. Escolha outra data acima."}
      </EmptyState>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {grupos.map((g, i) => (
        <Fragment key={g.categoriaId}>
          <FeedGroup categoriaNome={g.categoriaNome}>
            {g.partidas.map((partida) => (
              <MatchRow key={partida.id} partida={partida} forma={forma} tenantSlug={tenantSlug} />
            ))}
          </FeedGroup>
          {i === 0 && patrocinadores.length > 0 && (
            <SponsorFeedCard patrocinador={patrocinadores[i % patrocinadores.length]} />
          )}
        </Fragment>
      ))}
    </div>
  );
}
