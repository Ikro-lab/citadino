import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { paths } from "@/lib/tenant-path";

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

export function BracketView({ partidas, tenantSlug }: { partidas: PartidaChave[]; tenantSlug: string }) {
  if (partidas.length === 0) {
    return <EmptyState>O mata-mata ainda não começou.</EmptyState>;
  }

  const fases = ordemFase
    .map((fase) => ({ fase, jogos: partidas.filter((p) => p.fase === fase) }))
    .filter((f) => f.jogos.length > 0);

  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex gap-4" style={{ width: "max-content" }}>
        {fases.map(({ fase, jogos }) => (
          <div key={fase} className="w-56 shrink-0">
            <p className="mb-2 text-center text-sm font-semibold text-muted">
              {faseLabel[fase]}
            </p>
            <div className="flex flex-col gap-3">
              {jogos.map((p) => (
                <Link key={p.id} href={paths.partida(tenantSlug, p.id)}>
                  <Card className="p-3 tabular-nums hover:border-accent/50">
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.timeCasa.nome}</span>
                      {p.status !== "AGENDADA" && (
                        <span className="font-bold">{p.placarCasa}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="truncate">{p.timeFora.nome}</span>
                      {p.status !== "AGENDADA" && (
                        <span className="font-bold">{p.placarFora}</span>
                      )}
                    </div>
                    {p.status === "AO_VIVO" && (
                      <Badge variant="live" pulse className="mt-2">
                        Ao vivo
                      </Badge>
                    )}
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
