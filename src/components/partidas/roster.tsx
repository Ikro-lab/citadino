import Link from "next/link";
import type { PartidaDetalhe } from "@/lib/partidas";
import { paths } from "@/lib/tenant-path";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { cn } from "@/lib/utils";

type Atleta = PartidaDetalhe["timeCasa"]["atletas"][number];
type Vaga = "GOL" | "FIXO" | "ALA_E" | "ALA_D" | "PIVO";

/**
 * Monta o quinteto em losango (goleiro, fixo, dois alas, pivô) a partir da
 * posição cadastrada de cada atleta, pelo menor número de camisa. O sistema não
 * registra titulares por partida, então é uma escalação provável: vagas sem
 * jogador da posição são preenchidas por quem joga na "Linha" (ou outro de
 * linha), e o restante do elenco vai para o banco.
 */
function escalar(atletas: Atleta[]) {
  const resto = [...atletas];
  const tirar = (ok: (a: Atleta) => boolean) => {
    const i = resto.findIndex(ok);
    return i >= 0 ? resto.splice(i, 1)[0] : undefined;
  };
  const quadra: Partial<Record<Vaga, Atleta>> = {
    GOL: tirar((a) => a.posicao === "GOLEIRO"),
    FIXO: tirar((a) => a.posicao === "FIXO"),
    ALA_E: tirar((a) => a.posicao === "ALA"),
    ALA_D: tirar((a) => a.posicao === "ALA"),
    PIVO: tirar((a) => a.posicao === "PIVO"),
  };
  for (const vaga of ["FIXO", "ALA_E", "ALA_D", "PIVO"] as const) {
    quadra[vaga] ??= tirar((a) => a.posicao === "LINHA") ?? tirar((a) => a.posicao !== "GOLEIRO");
  }
  quadra.GOL ??= tirar(() => true);
  return { quadra, banco: resto };
}

// Posição de cada vaga na quadra (% da largura, % da altura). O time da casa
// ataca para cima, na metade de baixo; o visitante é o espelho, na de cima.
const POSICOES: Record<Vaga, { x: number; y: number }> = {
  GOL: { x: 50, y: 91 },
  FIXO: { x: 50, y: 78 },
  ALA_E: { x: 17, y: 66 },
  ALA_D: { x: 83, y: 66 },
  PIVO: { x: 50, y: 59 },
};

function nomeCurto(nome: string) {
  const partes = nome.trim().split(/\s+/);
  return partes.length > 1 ? `${partes[0]} ${partes[partes.length - 1]}` : nome;
}

function Jogador({
  atleta,
  x,
  y,
  visitante,
  tenantSlug,
}: {
  atleta: Atleta;
  x: number;
  y: number;
  visitante: boolean;
  tenantSlug: string;
}) {
  return (
    <Link
      href={paths.atleta(tenantSlug, atleta.id)}
      style={{ left: `${x}%`, top: `${y}%` }}
      className="group absolute flex w-20 -translate-x-1/2 -translate-y-[22px] flex-col items-center"
    >
      <span className="relative">
        <AtletaAvatar
          nome={atleta.nome}
          fotoUrl={atleta.fotoUrl}
          size={44}
          className={cn("ring-2 shadow-md transition-transform group-hover:scale-105", visitante ? "ring-accent" : "ring-white")}
        />
        <span className="absolute -right-1.5 -bottom-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-black tabular-nums shadow">
          {atleta.numero}
        </span>
      </span>
      <span className="mt-1 max-w-full truncate text-[11px] leading-tight font-semibold text-white [text-shadow:0_1px_2px_rgba(0,0,0,.6)]">
        {nomeCurto(atleta.nome)}
      </span>
    </Link>
  );
}

type Escalacao = ReturnType<typeof escalar>;

function Quadra({ casa, fora, tenantSlug }: { casa: Escalacao; fora: Escalacao; tenantSlug: string }) {
  const linha = "rgba(255,255,255,.75)";

  return (
    <div className="relative mx-auto aspect-[5/7] w-full max-w-md overflow-hidden rounded-2xl bg-[#1f7a4d]">
      <svg viewBox="0 0 100 140" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect x="3" y="3" width="94" height="134" rx="1.5" fill="none" stroke={linha} strokeWidth="0.6" />
        <line x1="3" y1="70" x2="97" y2="70" stroke={linha} strokeWidth="0.6" />
        <circle cx="50" cy="70" r="11" fill="none" stroke={linha} strokeWidth="0.6" />
        <circle cx="50" cy="70" r="0.9" fill={linha} />
        {/* Áreas do goleiro e gols */}
        <path d="M 30 3 A 20 18 0 0 0 70 3" fill="none" stroke={linha} strokeWidth="0.6" />
        <path d="M 30 137 A 20 18 0 0 1 70 137" fill="none" stroke={linha} strokeWidth="0.6" />
        <rect x="42" y="0.8" width="16" height="2.2" fill="none" stroke={linha} strokeWidth="0.6" />
        <rect x="42" y="137" width="16" height="2.2" fill="none" stroke={linha} strokeWidth="0.6" />
      </svg>

      {(Object.keys(POSICOES) as Vaga[]).map((vaga) => {
        const { x, y } = POSICOES[vaga];
        const a = casa.quadra[vaga];
        const b = fora.quadra[vaga];
        return (
          <span key={vaga}>
            {a && <Jogador atleta={a} x={x} y={y} visitante={false} tenantSlug={tenantSlug} />}
            {b && <Jogador atleta={b} x={100 - x} y={100 - y} visitante tenantSlug={tenantSlug} />}
          </span>
        );
      })}
    </div>
  );
}

function Banco({ nome, atletas, tenantSlug }: { nome: string; atletas: Atleta[]; tenantSlug: string }) {
  return (
    <div className="min-w-0">
      <p className="mb-2 truncate text-xs font-semibold text-muted">{nome}</p>
      {atletas.length === 0 ? (
        <p className="text-xs text-muted">Sem reservas.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {atletas.map((a) => (
            <li key={a.id}>
              <Link href={paths.atleta(tenantSlug, a.id)} className="flex min-w-0 items-center gap-2 text-sm hover:text-accent">
                <AtletaAvatar nome={a.nome} fotoUrl={a.fotoUrl} size={28} />
                <span className="shrink-0 font-semibold tabular-nums">#{a.numero}</span>
                <span className="truncate text-muted">{nomeCurto(a.nome)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function RotuloTime({ nome, visitante }: { nome: string; visitante: boolean }) {
  return (
    <p className="flex items-center justify-center gap-2 text-sm font-semibold">
      <span className={cn("h-2.5 w-2.5 rounded-full ring-2", visitante ? "bg-accent ring-accent/30" : "bg-white ring-border")} />
      {nome}
    </p>
  );
}

export function RosterPanel({ partida, tenantSlug }: { partida: PartidaDetalhe; tenantSlug: string }) {
  if (partida.timeCasa.atletas.length === 0 && partida.timeFora.atletas.length === 0) {
    return <p className="text-sm text-muted">Elencos não cadastrados.</p>;
  }

  const casa = escalar(partida.timeCasa.atletas);
  const fora = escalar(partida.timeFora.atletas);

  return (
    <div className="flex flex-col gap-3">
      <RotuloTime nome={partida.timeFora.nome} visitante />
      <Quadra casa={casa} fora={fora} tenantSlug={tenantSlug} />
      <RotuloTime nome={partida.timeCasa.nome} visitante={false} />
      <p className="text-center text-xs text-muted">Escalação provável, pela posição de cada atleta.</p>

      {(casa.banco.length > 0 || fora.banco.length > 0) && (
        <div className="mt-2 border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold">Banco</h3>
          <div className="grid grid-cols-2 gap-4">
            <Banco nome={partida.timeCasa.nome} atletas={casa.banco} tenantSlug={tenantSlug} />
            <Banco nome={partida.timeFora.nome} atletas={fora.banco} tenantSlug={tenantSlug} />
          </div>
        </div>
      )}
    </div>
  );
}
