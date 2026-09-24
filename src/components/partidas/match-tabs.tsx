"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChipRow, chipClass } from "@/components/ui/chips";
import { EventTimeline } from "@/components/partidas/event-timeline";
import { EventoIcon } from "@/components/partidas/evento-icon";
import { RosterPanel } from "@/components/partidas/roster";
import { StandingsTable } from "@/components/partidas/standings-table";
import type { PartidaDetalhe } from "@/lib/partidas";
import type { LinhaClassificacao } from "@/lib/classificacao";
import { paths } from "@/lib/tenant-path";
import { abasPartida, type AbaPartida } from "@/lib/labels";

function MomentosPrincipais({ partida, tenantSlug }: { partida: PartidaDetalhe; tenantSlug: string }) {
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
            <EventoIcon tipo="GOL" className="h-3.5 w-3.5" />
            <span className="w-7 font-semibold text-muted tabular-nums">{g.minuto}&apos;</span>
            {g.atleta ? (
              <Link href={paths.atleta(tenantSlug, g.atleta.id)} className="font-medium hover:text-accent hover:underline">
                {g.atleta.nome}
              </Link>
            ) : (
              <span className="font-medium">Gol</span>
            )}
            <span className="truncate text-muted">{isCasa ? partida.timeCasa.nome : partida.timeFora.nome}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function MatchTabs({
  partida,
  linhasClassificacao,
  tenantSlug,
  abaInicial = "detalhes",
}: {
  partida: PartidaDetalhe;
  linhasClassificacao: LinhaClassificacao[];
  tenantSlug: string;
  abaInicial?: AbaPartida;
}) {
  const [aba, setAba] = useState<AbaPartida>(abaInicial);
  const abaAtivaRef = useRef<HTMLButtonElement>(null);

  // Aberta por link (?aba=classificacao), a aba pode estar fora da tela no celular.
  useEffect(() => {
    abaAtivaRef.current?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, []);

  function trocarAba(nova: AbaPartida) {
    setAba(nova);
    // Mantém a aba na URL: recarregar ou compartilhar o link abre na mesma aba.
    const url = new URL(window.location.href);
    url.searchParams.set("aba", nova);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="flex flex-col gap-4">
      <ChipRow>
        <div role="tablist" aria-label="Seções da partida" className="flex gap-2">
          {abasPartida.map((a) => (
            <button
              key={a.id}
              ref={aba === a.id ? abaAtivaRef : undefined}
              type="button"
              role="tab"
              aria-selected={aba === a.id}
              onClick={() => trocarAba(a.id)}
              className={chipClass(aba === a.id)}
            >
              {a.label}
            </button>
          ))}
        </div>
      </ChipRow>

      {aba === "detalhes" && (
        <Card>
          <h2 className="mb-3 font-semibold">Principais momentos</h2>
          <MomentosPrincipais partida={partida} tenantSlug={tenantSlug} />
        </Card>
      )}

      {aba === "lances" && <EventTimeline partida={partida} tenantSlug={tenantSlug} />}

      {aba === "escalacao" && (
        <Card>
          <RosterPanel partida={partida} tenantSlug={tenantSlug} />
        </Card>
      )}

      {aba === "classificacao" && (
        <StandingsTable
          linhas={linhasClassificacao}
          destaqueIds={[partida.timeCasa.id, partida.timeFora.id]}
        />
      )}
    </div>
  );
}
