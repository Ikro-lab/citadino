"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePush } from "@/components/push/use-push";
import { paths } from "@/lib/tenant-path";

const CHAVE_FECHADO = "citadino:aviso-push-fechado-em";
const DIAS_ESCONDIDO = 7;

function fechadoRecentemente() {
  try {
    const em = Number(localStorage.getItem(CHAVE_FECHADO));
    return em > 0 && Date.now() - em < DIAS_ESCONDIDO * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

/**
 * Convite para ativar os avisos, no topo do feed e da partida. Só aparece
 * para quem pode ativar e ainda não ativou; fechado, volta depois de 7 dias.
 * Na partida, ativa para a categoria do jogo; no feed, para todos os jogos.
 */
export function AvisoNotificacoes({
  tenantId,
  tenantSlug,
  categoria,
}: {
  tenantId: string;
  tenantSlug: string;
  categoria?: { id: string; nome: string };
}) {
  const { estado, ativar } = usePush(tenantId);
  const [fechado, setFechado] = useState(true);
  const [pending, setPending] = useState(false);
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    // localStorage só existe no navegador; começa fechado para não piscar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFechado(fechadoRecentemente());
  }, []);

  function fechar() {
    try {
      localStorage.setItem(CHAVE_FECHADO, String(Date.now()));
    } catch {}
    setFechado(true);
  }

  async function onAtivar() {
    setPending(true);
    const ok = await ativar({ categoriaId: categoria?.id });
    setPending(false);
    if (ok) setPronto(true);
  }

  if (pronto) {
    return (
      <div className="mb-3 rounded-2xl bg-surface p-3 text-sm text-success dark:border dark:border-border">
        Pronto! Você vai receber os avisos{categoria ? ` dos jogos do ${categoria.nome}` : " dos jogos"}.
      </div>
    );
  }
  if (fechado || (estado !== "inativo" && estado !== "instalar-ios")) return null;

  return (
    <div className="mb-3 flex items-start gap-3 rounded-2xl bg-surface p-3 dark:border dark:border-border">
      <BellRing size={20} className="mt-0.5 shrink-0 text-accent" aria-hidden />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <p className="text-sm">
          {estado === "instalar-ios" ? (
            <>No iPhone, instale o Citadino na tela inicial para receber os gols na hora.</>
          ) : (
            <>
              Receba os gols e resultados{categoria ? ` do ${categoria.nome}` : ""} na hora, direto no celular.
            </>
          )}
        </p>
        {estado === "instalar-ios" ? (
          <Link href={paths.notificacoes(tenantSlug)} className="text-sm font-semibold text-accent underline">
            Ver como instalar
          </Link>
        ) : (
          <Button size="sm" className="self-start" onClick={onAtivar} disabled={pending}>
            {pending ? "Ativando..." : "Ativar avisos"}
          </Button>
        )}
      </div>
      <button type="button" onClick={fechar} aria-label="Fechar" className="shrink-0 p-1 text-muted">
        <X size={18} />
      </button>
    </div>
  );
}
