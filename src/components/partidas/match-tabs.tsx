"use client";

import { useState } from "react";
import Link from "next/link";
import { Goal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EventTimeline } from "@/components/partidas/event-timeline";
import { RosterPanel } from "@/components/partidas/roster";
import { StandingsTable } from "@/components/partidas/standings-table";
import type { PartidaDetalhe } from "@/lib/partidas";
import type { LinhaClassificacao } from "@/lib/classificacao";

const tabs = ["Detalhes", "Linha do Tempo", "Escalação", "Classificação"] as const;
type Tab = (typeof tabs)[number];

function MomentosPrincipais({ partida }: { partida: PartidaDetalhe }) {
  const gols = partida.eventos.filter((e) => e.tipo === "GOL");

  if (gols.length === 0) {
    return <p className="text-sm text-muted">Nenhum gol registrado ainda.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {gols.map((g) => {
        const isCasa = g.timeId === partida.timeCasa.id;
        return (
          <li key={g.id} className="flex items-center gap-2 text-sm">
            <Goal size={14} className="shrink-0 text-accent" />
            <span className="font-mono font-semibold text-muted">{g.minuto}&apos;</span>
            {g.atleta ? (
              <Link href={`/atleta/${g.atleta.id}`} className="font-medium hover:text-accent hover:underline">
                {g.atleta.nome}
              </Link>
            ) : (
              <span className="font-medium">Gol</span>
            )}
            <span className="text-muted">· {isCasa ? partida.timeCasa.nome : partida.timeFora.nome}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function MatchTabs({
  partida,
  linhasClassificacao,
}: {
  partida: PartidaDetalhe;
  linhasClassificacao: LinhaClassificacao[];
}) {
  const [tab, setTab] = useState<Tab>("Detalhes");

  return (
    <div className="flex flex-col gap-4">
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 [scrollbar-width:none]">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "shrink-0 rounded-lg px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors",
              tab === t ? "bg-accent text-accent-foreground" : "text-muted hover:bg-surface"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Detalhes" && (
        <Card>
          <h2 className="mb-3 font-semibold">Principais momentos</h2>
          <MomentosPrincipais partida={partida} />
        </Card>
      )}

      {tab === "Linha do Tempo" && <EventTimeline partida={partida} />}

      {tab === "Escalação" && (
        <Card>
          <RosterPanel partida={partida} />
        </Card>
      )}

      {tab === "Classificação" && (
        <StandingsTable
          linhas={linhasClassificacao}
          destaqueIds={[partida.timeCasa.id, partida.timeFora.id]}
        />
      )}
    </div>
  );
}
