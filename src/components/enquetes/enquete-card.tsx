"use client";

import { useEffect, useState, useTransition } from "react";
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
}: {
  enqueteId: string;
  pergunta: string;
  rodada: number;
  opcoesIniciais: Opcao[];
  jaVotouOpcaoId: string | null;
}) {
  const [opcoes, setOpcoes] = useState(opcoesIniciais);
  const [votadaEm, setVotadaEm] = useState(jaVotouOpcaoId);
  const [erro, setErro] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/enquetes/${enqueteId}`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setOpcoes(data.opcoes);
        }
      } catch {
        // ignore transient network errors
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [enqueteId]);

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
      <p className="text-xs font-semibold uppercase tracking-wide text-accent">
        Rodada {rodada}
      </p>
      <h3 className="mb-3 font-semibold">{pergunta}</h3>

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
                <div className="relative flex items-center justify-between text-sm">
                  <span className={escolhida ? "font-semibold text-accent" : ""}>
                    {o.atletaNome} <span className="text-muted">· {o.timeNome}</span>
                  </span>
                  <span className="font-semibold">{pct}%</span>
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
              className="justify-between"
            >
              <span>
                {o.atletaNome} <span className="text-muted">· {o.timeNome}</span>
              </span>
            </Button>
          );
        })}
      </div>

      {erro && <p className="mt-2 text-xs text-danger">{erro}</p>}
      {votadaEm && (
        <p className="mt-2 text-xs text-muted">{total} voto(s) até agora.</p>
      )}
    </Card>
  );
}
