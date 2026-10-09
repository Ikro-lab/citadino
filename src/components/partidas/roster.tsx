"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeftRight, Footprints, Goal, UserRound, X } from "lucide-react";
import type { PartidaDetalhe } from "@/lib/partidas";
import { paths } from "@/lib/tenant-path";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { CartaoIcon } from "@/components/partidas/evento-icon";
import { addEvento, substituirAtleta } from "@/lib/actions/partidas";
import { VAGAS, escalacaoAtual, minutoDeJogo, type Vaga } from "@/lib/escalacao";
import { cn } from "@/lib/utils";

type Atleta = PartidaDetalhe["timeCasa"]["atletas"][number];
type Escalacao = ReturnType<typeof escalacaoAtual<Atleta>>;
type Selecionado = { atleta: Atleta; timeId: string; banco: Atleta[] };

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
  onEditar,
}: {
  atleta: Atleta;
  x: number;
  y: number;
  visitante: boolean;
  tenantSlug: string;
  /** Presente para quem pode editar: abre as ações em vez de ir ao perfil. */
  onEditar?: () => void;
}) {
  const conteudo = (
    <>
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
    </>
  );
  const classe = "group absolute flex w-20 -translate-x-1/2 -translate-y-[22px] flex-col items-center";
  const estilo = { left: `${x}%`, top: `${y}%` };

  return onEditar ? (
    <button type="button" onClick={onEditar} style={estilo} className={classe} aria-label={`Ações para ${atleta.nome}`}>
      {conteudo}
    </button>
  ) : (
    <Link href={paths.atleta(tenantSlug, atleta.id)} style={estilo} className={classe}>
      {conteudo}
    </Link>
  );
}

function Quadra({
  casa,
  fora,
  tenantSlug,
  onEditar,
}: {
  casa: Escalacao;
  fora: Escalacao;
  tenantSlug: string;
  onEditar: (atleta: Atleta, visitante: boolean) => (() => void) | undefined;
}) {
  const linha = "rgba(255,255,255,.9)";

  return (
    <div
      className="relative mx-auto aspect-[5/7] w-full max-w-md overflow-hidden rounded-2xl"
      // Piso de madeira de quadra de futsal: tábuas finas sobre um tom marrom-claro.
      style={{
        backgroundColor: "#b9773f",
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(0,0,0,.07) 0 1px, transparent 1px 18px), linear-gradient(180deg, rgba(255,255,255,.08), rgba(0,0,0,.08))",
      }}
    >
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

      {VAGAS.map((vaga) => {
        const { x, y } = POSICOES[vaga];
        const a = casa.quadra[vaga];
        const b = fora.quadra[vaga];
        return (
          <span key={vaga}>
            {a && <Jogador atleta={a} x={x} y={y} visitante={false} tenantSlug={tenantSlug} onEditar={onEditar(a, false)} />}
            {b && <Jogador atleta={b} x={100 - x} y={100 - y} visitante tenantSlug={tenantSlug} onEditar={onEditar(b, true)} />}
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

function BotaoAcao({ onClick, icone, children, disabled }: { onClick: () => void; icone: React.ReactNode; children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-12 items-center gap-3 rounded-2xl bg-field px-4 text-left text-sm font-semibold hover:bg-border disabled:opacity-50"
    >
      <span className="flex w-5 justify-center">{icone}</span>
      {children}
    </button>
  );
}

/**
 * Painel de ações de quem pode editar (admin; treinador no próprio time).
 * Ao vivo: lances (gol, assistência, amarelo) e substituição, todos no minuto
 * atual. Antes do jogo: trocar titular, sem gerar lance.
 */
function PainelAcoes({
  sel,
  partida,
  tenantSlug,
  onFechar,
}: {
  sel: Selecionado;
  partida: PartidaDetalhe;
  tenantSlug: string;
  onFechar: () => void;
}) {
  const router = useRouter();
  const [modo, setModo] = useState<"acoes" | "trocar">("acoes");
  const [erro, setErro] = useState<string | null>(null);
  const [pendente, iniciar] = useTransition();
  const aoVivo = partida.status === "AO_VIVO";

  function executar(acao: () => Promise<unknown>) {
    setErro(null);
    iniciar(async () => {
      try {
        await acao();
        router.refresh();
        onFechar();
      } catch (e) {
        setErro(e instanceof Error ? e.message : "Não foi possível salvar.");
      }
    });
  }

  function lancar(tipo: "GOL" | "ASSISTENCIA" | "CARTAO_AMARELO") {
    const fd = new FormData();
    fd.set("tipo", tipo);
    fd.set("timeId", sel.timeId);
    fd.set("atletaId", sel.atleta.id);
    fd.set("minuto", String(minutoDeJogo(partida.dataHora)));
    executar(() => addEvento(partida.id, fd));
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center" onClick={onFechar}>
      <div
        role="dialog"
        aria-label={`Ações para ${sel.atleta.nome}`}
        className="w-full max-w-md rounded-t-3xl bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center gap-3">
          <AtletaAvatar nome={sel.atleta.nome} fotoUrl={sel.atleta.fotoUrl} size={48} />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{sel.atleta.nome}</p>
            <p className="text-xs text-muted">
              #{sel.atleta.numero}
              {aoVivo ? ` · lança no minuto ${minutoDeJogo(partida.dataHora)}'` : " · antes do jogo"}
            </p>
          </div>
          <button type="button" onClick={onFechar} aria-label="Fechar" className="rounded-full p-2 hover:bg-field">
            <X size={18} />
          </button>
        </div>

        {modo === "acoes" ? (
          <div className="flex flex-col gap-2">
            {aoVivo && (
              <>
                <BotaoAcao onClick={() => lancar("GOL")} disabled={pendente} icone={<Goal size={18} className="text-accent" />}>
                  Gol
                </BotaoAcao>
                <BotaoAcao onClick={() => lancar("ASSISTENCIA")} disabled={pendente} icone={<Footprints size={18} className="text-accent" />}>
                  Assistência
                </BotaoAcao>
                <BotaoAcao onClick={() => lancar("CARTAO_AMARELO")} disabled={pendente} icone={<CartaoIcon cor="amarelo" />}>
                  Cartão amarelo
                </BotaoAcao>
              </>
            )}
            <BotaoAcao onClick={() => setModo("trocar")} disabled={pendente || sel.banco.length === 0} icone={<ArrowLeftRight size={18} />}>
              {aoVivo ? "Substituição" : "Trocar titular"}
              {sel.banco.length === 0 && <span className="font-normal text-muted"> (sem reservas)</span>}
            </BotaoAcao>
            <Link href={paths.atleta(tenantSlug, sel.atleta.id)} className="flex h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold text-muted hover:bg-field">
              <span className="flex w-5 justify-center">
                <UserRound size={18} />
              </span>
              Ver perfil
            </Link>
          </div>
        ) : (
          <div>
            <p className="mb-2 text-sm font-semibold">
              {aoVivo ? "Quem entra no lugar dele?" : "Quem começa no lugar dele?"}
            </p>
            <ul className="flex max-h-[50vh] flex-col gap-1 overflow-y-auto">
              {sel.banco.map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() => executar(() => substituirAtleta(partida.id, sel.timeId, sel.atleta.id, a.id))}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-field disabled:opacity-50"
                  >
                    <AtletaAvatar nome={a.nome} fotoUrl={a.fotoUrl} size={36} />
                    <span className="font-semibold tabular-nums">#{a.numero}</span>
                    <span className="truncate text-sm">{a.nome}</span>
                  </button>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => setModo("acoes")} className="mt-2 text-sm font-semibold text-muted hover:text-foreground">
              ← Voltar
            </button>
          </div>
        )}

        {pendente && <p className="mt-3 text-xs text-muted">Salvando...</p>}
        {erro && <p className="mt-3 text-xs text-danger">{erro}</p>}
      </div>
    </div>
  );
}

export function RosterPanel({
  partida,
  tenantSlug,
  timesEditaveis = [],
}: {
  partida: PartidaDetalhe;
  tenantSlug: string;
  /** Times em que o usuário logado pode mexer (admin: os dois; treinador: o dele). */
  timesEditaveis?: string[];
}) {
  const [sel, setSel] = useState<Selecionado | null>(null);

  if (partida.timeCasa.atletas.length === 0 && partida.timeFora.atletas.length === 0) {
    return <p className="text-sm text-muted">Elencos não cadastrados.</p>;
  }

  const casa = escalacaoAtual(partida.timeCasa.atletas, partida.escalacaoCasa, partida.eventos.filter((e) => e.timeId === partida.timeCasa.id));
  const fora = escalacaoAtual(partida.timeFora.atletas, partida.escalacaoFora, partida.eventos.filter((e) => e.timeId === partida.timeFora.id));
  const editavel = partida.status === "AO_VIVO" || partida.status === "AGENDADA";
  const comSubstituicoes = partida.eventos.some((e) => e.tipo === "SUBSTITUICAO" && e.atletaEntraId);
  const origem = partida.escalacaoCasa || partida.escalacaoFora ? "Escalação definida pela organização" : "Escalação provável, pela posição de cada atleta";

  const onEditar = (atleta: Atleta, visitante: boolean) => {
    const time = visitante ? partida.timeFora : partida.timeCasa;
    if (!editavel || !timesEditaveis.includes(time.id)) return undefined;
    return () => setSel({ atleta, timeId: time.id, banco: (visitante ? fora : casa).banco });
  };

  return (
    <div className="flex flex-col gap-3">
      <RotuloTime nome={partida.timeFora.nome} visitante />
      <Quadra casa={casa} fora={fora} tenantSlug={tenantSlug} onEditar={onEditar} />
      <RotuloTime nome={partida.timeCasa.nome} visitante={false} />
      <p className="text-center text-xs text-muted">
        {editavel && timesEditaveis.length > 0
          ? "Toque num jogador para lançar um lance ou fazer uma substituição."
          : `${origem}${comSubstituicoes ? ", com as substituições do jogo" : ""}.`}
      </p>

      {(casa.banco.length > 0 || fora.banco.length > 0) && (
        <div className="mt-2 border-t border-border pt-4">
          <h3 className="mb-3 text-sm font-semibold">Banco</h3>
          <div className="grid grid-cols-2 gap-4">
            <Banco nome={partida.timeCasa.nome} atletas={casa.banco} tenantSlug={tenantSlug} />
            <Banco nome={partida.timeFora.nome} atletas={fora.banco} tenantSlug={tenantSlug} />
          </div>
        </div>
      )}

      {sel && <PainelAcoes sel={sel} partida={partida} tenantSlug={tenantSlug} onFechar={() => setSel(null)} />}
    </div>
  );
}
