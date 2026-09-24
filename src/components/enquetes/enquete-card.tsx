"use client";

import { useState, useTransition } from "react";
import { usePolling } from "@/lib/use-polling";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { votar } from "@/lib/actions/enquetes";

type Opcao = { id: string; atletaNome: string; timeNome: string; votos: number };

export function EnqueteCard({
  enqueteId,
  pergunta,
  rodada,
  opcoesIniciais,
  jaVotouOpcaoId,
  tenantSlug,
}: {
  enqueteId: string;
  pergunta: string;
  rodada: number;
  opcoesIniciais: Opcao[];
  jaVotouOpcaoId: string | null;
  tenantSlug: string;
}) {
  const [opcoes, setOpcoes] = useState(opcoesIniciais);
  const [votadaEm, setVotadaEm] = useState(jaVotouOpcaoId);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Parcial só aparece depois do voto — antes disso não há o que atualizar.
  usePolling(
    async () => {
      try {
        const res = await fetch(`/api/${tenantSlug}/enquetes/${enqueteId}`);
        if (res.ok) {
          const data = await res.json();
          setOpcoes(data.opcoes);
        }
      } catch {
        // ignore transient network errors
      }
    },
    10000,
    votadaEm !== null
  );

  const total = opcoes.reduce((acc, o) => acc + o.votos, 0);

  function votarEm(opcaoId: string) {
    setErro(null);
    startTransition(async () => {
      const result = await votar(enqueteId, opcaoId);
      if (result?.error) {
        setErro(result.error);
        setVotadaEm(opcaoId);
      } else {
        setVotadaEm(opcaoId);
        setOpcoes((prev) =>
          prev.map((o) => (o.id === opcaoId ? { ...o, votos: o.votos + 1 } : o))
        );
      }
    });
  }

  return (
    <Card>
      <h2 className="font-semibold">{pergunta}</h2>
      <p className="mb-3 text-sm text-muted">Rodada {rodada}</p>

      <div className="flex flex-col gap-2">
        {opcoes.map((o) => {
          const pct = total > 0 ? Math.round((o.votos / total) * 100) : 0;
          const escolhida = votadaEm === o.id;

          if (votadaEm) {
            return (
              <div key={o.id} className="relative overflow-hidden rounded-xl border border-border p-3">
                <div
                  className="absolute inset-y-0 left-0 bg-accent-soft"
                  style={{ width: `${pct}%` }}
                />
                <div className="relative flex items-center justify-between gap-3 text-sm">
                  <span className="min-w-0">
                    <span className={`block truncate ${escolhida ? "font-semibold text-accent" : "font-medium"}`}>
                      {o.atletaNome}
                      {escolhida && <span className="sr-only"> (seu voto)</span>}
                    </span>
                    <span className="block truncate text-xs text-muted">{o.timeNome}</span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums">{pct}%</span>
                </div>
              </div>
            );
          }

          return (
            <Button
              key={o.id}
              type="button"
              variant="secondary"
              disabled={pending}
              onClick={() => votarEm(o.id)}
              className="h-auto min-h-12 justify-start py-2 text-left"
            >
              <span className="min-w-0">
                <span className="block truncate">{o.atletaNome}</span>
                <span className="block truncate text-xs font-normal text-muted">{o.timeNome}</span>
              </span>
            </Button>
          );
        })}
      </div>

      {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}
      {votadaEm && (
        <p className="mt-2 text-xs text-muted">
          {total === 1 ? "1 voto até agora." : `${total} votos até agora.`}
        </p>
      )}
    </Card>
  );
}
