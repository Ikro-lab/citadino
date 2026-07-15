import { Card } from "@/components/ui/card";
import type { PartidaDetalhe } from "@/lib/partidas";

function RosterColumn({
  nome,
  atletas,
}: {
  nome: string;
  atletas: PartidaDetalhe["timeCasa"]["atletas"];
}) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">{nome}</p>
      <ul className="flex flex-col gap-1.5">
        {atletas.map((a) => (
          <li key={a.id} className="flex items-center gap-2 text-sm text-muted">
            <span className="font-mono font-semibold text-foreground">#{a.numero}</span>
            {a.nome}
          </li>
        ))}
        {atletas.length === 0 && (
          <li className="text-sm text-muted">Elenco não cadastrado.</li>
        )}
      </ul>
    </div>
  );
}

export function Roster({ partida }: { partida: PartidaDetalhe }) {
  return (
    <details className="group">
      <summary className="flex cursor-pointer list-none items-center justify-between rounded-2xl border border-border bg-white p-4 text-sm font-semibold shadow-sm">
        Escalações
        <span className="text-muted transition-transform group-open:rotate-180">▾</span>
      </summary>
      <Card className="mt-2 grid grid-cols-2 gap-4 rounded-t-none border-t-0">
        <RosterColumn nome={partida.timeCasa.nome} atletas={partida.timeCasa.atletas} />
        <RosterColumn nome={partida.timeFora.nome} atletas={partida.timeFora.atletas} />
      </Card>
    </details>
  );
}
