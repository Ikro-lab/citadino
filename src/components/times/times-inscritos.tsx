import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { paths } from "@/lib/tenant-path";
import { EmptyState } from "@/components/ui/empty-state";
import { Escudo } from "@/components/times/escudo";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { posicaoLabel, type PosicaoAtleta } from "@/lib/labels";

/** Só dados públicos: nada de documento, comprovante ou data de nascimento. */
export type TimeInscrito = {
  id: string;
  nome: string;
  escudoUrl: string | null;
  atletas: { id: string; nome: string; numero: number; posicao: string; fotoUrl: string | null }[];
};

export function TimesInscritos({ times, tenantSlug }: { times: TimeInscrito[]; tenantSlug: string }) {
  if (times.length === 0) {
    return <EmptyState>Nenhum time inscrito nesta categoria ainda.</EmptyState>;
  }

  return (
    <div className="flex flex-col gap-2">
      {times.map((time) => (
        <details key={time.id} className="group overflow-hidden rounded-2xl bg-surface dark:border dark:border-border">
          <summary className="flex min-h-12 cursor-pointer list-none items-center gap-3 px-4 py-2 [&::-webkit-details-marker]:hidden">
            <Escudo nome={time.nome} escudoUrl={time.escudoUrl} size={28} />
            <span className="flex-1 truncate text-sm font-semibold">{time.nome}</span>
            <span className="text-xs text-muted tabular-nums">
              {time.atletas.length} {time.atletas.length === 1 ? "atleta" : "atletas"}
            </span>
            <ChevronDown size={18} aria-hidden className="text-muted transition-transform group-open:rotate-180" />
          </summary>
          <div className="border-t border-border">
            {time.atletas.length === 0 ? (
              <p className="px-4 py-4 text-sm text-muted">Elenco ainda não cadastrado.</p>
            ) : (
              <ul>
                {time.atletas.map((a) => (
                  <li key={a.id} className="border-b border-border last:border-0">
                    <Link
                      href={paths.atleta(tenantSlug, a.id)}
                      className="flex min-h-12 items-center gap-3 px-4 py-2 text-sm hover:bg-field"
                    >
                      <AtletaAvatar nome={a.nome} fotoUrl={a.fotoUrl} size={32} />
                      <span className="w-8 shrink-0 font-semibold tabular-nums text-muted">#{a.numero}</span>
                      <span className="min-w-0 flex-1 truncate font-medium">{a.nome}</span>
                      <span className="shrink-0 text-xs text-muted">
                        {posicaoLabel[a.posicao as PosicaoAtleta]}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </details>
      ))}
    </div>
  );
}
