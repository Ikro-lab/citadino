import Link from "next/link";
import type { PartidaDetalhe } from "@/lib/partidas";

export function RosterColumn({
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
            <Link href={`/atleta/${a.id}`} className="hover:text-accent hover:underline">
              {a.nome}
            </Link>
          </li>
        ))}
        {atletas.length === 0 && (
          <li className="text-sm text-muted">Elenco não cadastrado.</li>
        )}
      </ul>
    </div>
  );
}

export function RosterPanel({ partida }: { partida: PartidaDetalhe }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <RosterColumn nome={partida.timeCasa.nome} atletas={partida.timeCasa.atletas} />
      <RosterColumn nome={partida.timeFora.nome} atletas={partida.timeFora.atletas} />
    </div>
  );
}
