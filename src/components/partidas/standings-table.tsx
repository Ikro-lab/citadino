import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Escudo } from "@/components/times/escudo";
import type { LinhaClassificacao } from "@/lib/classificacao";

// No celular ficam só as colunas que decidem a posição (P, J, V, SG);
// E, D, GP e GC aparecem a partir de telas maiores.
const colunas: { key: keyof LinhaClassificacao; label: string; title: string; mobile: boolean }[] = [
  { key: "pontos", label: "P", title: "Pontos", mobile: true },
  { key: "jogos", label: "J", title: "Jogos", mobile: true },
  { key: "vitorias", label: "V", title: "Vitórias", mobile: true },
  { key: "empates", label: "E", title: "Empates", mobile: false },
  { key: "derrotas", label: "D", title: "Derrotas", mobile: false },
  { key: "golsPro", label: "GP", title: "Gols pró", mobile: false },
  { key: "golsContra", label: "GC", title: "Gols contra", mobile: false },
  { key: "saldoGols", label: "SG", title: "Saldo de gols", mobile: true },
];

export function StandingsTable({
  linhas,
  destaqueIds,
}: {
  linhas: LinhaClassificacao[];
  destaqueIds?: string[];
}) {
  if (linhas.length === 0) {
    return <EmptyState>Nenhum time cadastrado nesta categoria.</EmptyState>;
  }

  return (
    <Card className="overflow-hidden p-0">
      <table className="w-full table-fixed text-sm tabular-nums">
        <thead>
          <tr className="border-b border-border text-xs text-muted">
            <th className="w-8 py-2.5 pl-3 text-left font-medium">#</th>
            <th className="py-2.5 pl-2 text-left font-medium">Time</th>
            {colunas.map((c) => (
              <th
                key={c.key}
                title={c.title}
                className={cn("w-9 py-2.5 text-center font-medium sm:w-10", !c.mobile && "hidden sm:table-cell")}
              >
                <abbr title={c.title} className="no-underline">
                  {c.label}
                </abbr>
              </th>
            ))}
            <th className="w-2 sm:w-3" aria-hidden />
          </tr>
        </thead>
        <tbody>
          {linhas.map((l, i) => (
            <tr
              key={l.timeId}
              className={cn(
                "border-b border-border last:border-0",
                destaqueIds?.includes(l.timeId) && "bg-accent-soft"
              )}
            >
              <td className="py-2.5 pl-3 font-semibold text-muted">{i + 1}</td>
              <td className="py-2.5 pl-2">
                <span className="flex min-w-0 items-center gap-2">
                  <Escudo nome={l.nome} escudoUrl={l.escudoUrl} size={20} />
                  <span className="truncate font-medium">{l.nome}</span>
                </span>
              </td>
              {colunas.map((c) => (
                <td
                  key={c.key}
                  className={cn(
                    "py-2.5 text-center",
                    c.key === "pontos" && "font-bold text-foreground",
                    c.key !== "pontos" && "text-muted",
                    !c.mobile && "hidden sm:table-cell"
                  )}
                >
                  {l[c.key]}
                </td>
              ))}
              <td aria-hidden />
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
