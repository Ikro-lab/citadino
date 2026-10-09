"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { tabClass } from "@/components/ui/chips";
import { EventTimeline } from "@/components/partidas/event-timeline";
import { EventoIcon } from "@/components/partidas/evento-icon";
import { RosterPanel } from "@/components/partidas/roster";
import { StandingsTable } from "@/components/partidas/standings-table";
import type { PartidaDetalhe } from "@/lib/partidas";
import type { LinhaClassificacao } from "@/lib/classificacao";
import { paths } from "@/lib/tenant-path";
import { abasPartida, tipoEventoLabel, type AbaPartida, type TipoEvento } from "@/lib/labels";
import { centralizarChip } from "@/lib/centralizar-chip";

const TIPOS_MOMENTOS = ["GOL", "ASSISTENCIA", "CARTAO_AMARELO", "CARTAO_VERMELHO", "SUBSTITUICAO"];

function MomentosPrincipais({ partida, tenantSlug }: { partida: PartidaDetalhe; tenantSlug: string }) {
  const momentos = partida.eventos.filter((e) => TIPOS_MOMENTOS.includes(e.tipo));

  if (momentos.length === 0) {
    return <p className="text-sm text-muted">Nenhum lance registrado ainda.</p>;
  }

  const linkAtleta = (a: { id: string; nome: string }) => (
    <Link href={paths.atleta(tenantSlug, a.id)} className="font-medium hover:text-accent hover:underline">
      {a.nome}
    </Link>
  );

  return (
    <ul className="flex flex-col gap-2">
      {momentos.map((e) => {
        const isCasa = e.timeId === partida.timeCasa.id;
        return (
          <li key={e.id} className="flex items-start gap-2 text-sm">
            <span className="mt-0.5 flex w-3.5 shrink-0 justify-center">
              <EventoIcon tipo={e.tipo} className="h-3.5 w-3.5" />
            </span>
            <span className="w-7 shrink-0 font-semibold text-muted tabular-nums">{e.minuto}&apos;</span>
            <span className="min-w-0">
              {e.tipo === "SUBSTITUICAO" && e.atleta && e.atletaEntra ? (
                <>
                  <span className="text-muted">Sai </span>
                  {linkAtleta(e.atleta)}
                  <span className="text-muted">, entra </span>
                  {linkAtleta(e.atletaEntra)}
                </>
              ) : e.atleta ? (
                linkAtleta(e.atleta)
              ) : (
                <span className="font-medium">{tipoEventoLabel[e.tipo as TipoEvento] ?? "Lance"}</span>
              )}
              <span className="text-muted"> · {isCasa ? partida.timeCasa.nome : partida.timeFora.nome}</span>
            </span>
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
  timesEditaveis = [],
}: {
  partida: PartidaDetalhe;
  linhasClassificacao: LinhaClassificacao[];
  tenantSlug: string;
  abaInicial?: AbaPartida;
  timesEditaveis?: string[];
}) {
  const [aba, setAba] = useState<AbaPartida>(abaInicial);
  const abaAtivaRef = useRef<HTMLButtonElement>(null);

  // Aberta por link (?aba=classificacao), a aba pode estar fora da tela no celular.
  useEffect(() => {
    centralizarChip(abaAtivaRef.current);
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
      <div
        role="tablist"
        aria-label="Seções da partida"
        className="-mx-4 flex overflow-x-auto border-b border-border px-2 [scrollbar-width:none]"
      >
        {abasPartida.map((a) => (
          <button
            key={a.id}
            ref={aba === a.id ? abaAtivaRef : undefined}
            type="button"
            role="tab"
            aria-selected={aba === a.id}
            onClick={() => trocarAba(a.id)}
            className={tabClass(aba === a.id)}
          >
            {a.label}
          </button>
        ))}
      </div>

      {aba === "detalhes" && (
        <Card>
          <h2 className="mb-3 font-semibold">Principais momentos</h2>
          <MomentosPrincipais partida={partida} tenantSlug={tenantSlug} />
        </Card>
      )}

      {aba === "lances" && <EventTimeline partida={partida} tenantSlug={tenantSlug} />}

      {aba === "escalacao" && (
        <Card>
          <RosterPanel partida={partida} tenantSlug={tenantSlug} timesEditaveis={timesEditaveis} />
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
