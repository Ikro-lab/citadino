import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { LinhaClassificacao } from "@/lib/classificacao";

export function StandingsTable({
  linhas,
  destaqueIds,
}: {
  linhas: LinhaClassificacao[];
  destaqueIds?: string[];
}) {
  if (linhas.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border py-12 text-center text-sm text-muted">
        Nenhum time cadastrado nesta categoria.
      </p>
    );
  }

  return (
    <Card className="overflow-x-auto p-0">
      <table className="w-full min-w-[520px] text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted">
            <th className="px-3 py-3 font-medium">#</th>
            <th className="px-3 py-3 font-medium">Time</th>
            <th className="px-2 py-3 text-center font-medium">P</th>
            <th className="px-2 py-3 text-center font-medium">J</th>
            <th className="px-2 py-3 text-center font-medium">V</th>
            <th className="px-2 py-3 text-center font-medium">E</th>
            <th className="px-2 py-3 text-center font-medium">D</th>
            <th className="px-2 py-3 text-center font-medium">GP</th>
            <th className="px-2 py-3 text-center font-medium">GC</th>
            <th className="px-2 py-3 text-center font-medium">SG</th>
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
              <td className="px-3 py-3 font-semibold text-muted">{i + 1}</td>
              <td className="px-3 py-3 font-medium">{l.nome}</td>
              <td className="px-2 py-3 text-center font-bold text-accent">{l.pontos}</td>
              <td className="px-2 py-3 text-center">{l.jogos}</td>
              <td className="px-2 py-3 text-center">{l.vitorias}</td>
              <td className="px-2 py-3 text-center">{l.empates}</td>
              <td className="px-2 py-3 text-center">{l.derrotas}</td>
              <td className="px-2 py-3 text-center">{l.golsPro}</td>
              <td className="px-2 py-3 text-center">{l.golsContra}</td>
              <td className="px-2 py-3 text-center">{l.saldoGols}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
