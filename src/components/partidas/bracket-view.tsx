import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { paths } from "@/lib/tenant-path";
import type { FaseProjetada, Vaga } from "@/lib/chaveamento";

type PartidaChave = {
  id: string;
  fase: string;
  timeCasa: { nome: string };
  timeFora: { nome: string };
  placarCasa: number;
  placarFora: number;
  status: string;
};

const faseLabel: Record<string, string> = {
  OITAVAS: "Oitavas",
  QUARTAS: "Quartas",
  SEMIFINAL: "Semifinal",
  TERCEIRO_LUGAR: "3º lugar",
  FINAL: "Final",
};

const ordemFase = ["OITAVAS", "QUARTAS", "SEMIFINAL", "TERCEIRO_LUGAR", "FINAL"];

function LadoProjetado({ lado }: { lado: Vaga | string }) {
  if (typeof lado === "string") return <span className="truncate text-muted">{lado}</span>;
  return (
    <span className="flex min-w-0 items-center gap-2">
      <span className="w-6 shrink-0 text-xs font-semibold text-muted">{lado.semente}º</span>
      <span className="truncate">{lado.time?.nome ?? "A definir"}</span>
    </span>
  );
}

/**
 * Chave do mata-mata. Fase com jogos cadastrados mostra os jogos; fase sem
 * jogos mostra o confronto projetado pela classificação do momento.
 */
export function BracketView({
  partidas,
  projecao,
  tenantSlug,
}: {
  partidas: PartidaChave[];
  projecao?: FaseProjetada[] | null;
  tenantSlug: string;
}) {
  const fases = ordemFase
    .map((fase) => ({
      fase,
      jogos: partidas.filter((p) => p.fase === fase),
      projetados: projecao?.find((f) => f.fase === fase)?.jogos ?? [],
    }))
    .filter((f) => f.jogos.length > 0 || f.projetados.length > 0);

  if (fases.length === 0) {
    return <EmptyState>O mata-mata ainda não começou.</EmptyState>;
  }

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex gap-4" style={{ width: "max-content" }}>
        {fases.map(({ fase, jogos, projetados }) => (
          <div key={fase} className="w-56 shrink-0">
            <p className="mb-2 text-center text-sm font-semibold text-muted">{faseLabel[fase]}</p>
            <div className="flex flex-col gap-3">
              {jogos.length > 0
                ? jogos.map((p) => (
                    <Link key={p.id} href={paths.partida(tenantSlug, p.id)}>
                      <Card className="p-3 tabular-nums hover:border-accent/50">
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{p.timeCasa.nome}</span>
                          {p.status !== "AGENDADA" && <span className="font-bold">{p.placarCasa}</span>}
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="truncate">{p.timeFora.nome}</span>
                          {p.status !== "AGENDADA" && <span className="font-bold">{p.placarFora}</span>}
                        </div>
                        {p.status === "AO_VIVO" && (
                          <Badge variant="live" pulse className="mt-2">
                            Ao vivo
                          </Badge>
                        )}
                      </Card>
                    </Link>
                  ))
                : projetados.map((j) => (
                    <Card key={j.rotulo} className="flex flex-col gap-1 p-3 text-sm">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">{j.rotulo}</span>
                      <LadoProjetado lado={j.casa} />
                      <LadoProjetado lado={j.fora} />
                    </Card>
                  ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
