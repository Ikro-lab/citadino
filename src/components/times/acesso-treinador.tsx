"use client";

import { useState, useTransition } from "react";
import { Check, Copy, KeyRound, MessageCircle } from "lucide-react";
import { gerarLinkSenha } from "@/lib/actions/senha";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";

/**
 * Acesso do treinador na página do time (admin): mostra o e-mail da conta e
 * gera o link de nova senha para mandar pelo WhatsApp.
 */
export function AcessoTreinador({
  treinador,
  campeonatoNome,
}: {
  treinador: { id: string; name: string; email: string };
  campeonatoNome: string;
}) {
  const [link, setLink] = useState<{ url: string; expiraEm: string } | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<"email" | "link" | null>(null);
  const [pendente, iniciar] = useTransition();

  const copiar = async (texto: string, qual: "email" | "link") => {
    await navigator.clipboard.writeText(texto);
    setCopiado(qual);
    setTimeout(() => setCopiado(null), 1500);
  };
  const validade = link
    ? new Date(link.expiraEm).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="text-sm font-medium">{treinador.name}</p>
        <div className="mt-1 flex items-center gap-2">
          <span className="min-w-0 flex-1 truncate text-sm text-muted">{treinador.email}</span>
          <button
            type="button"
            onClick={() => copiar(treinador.email, "email")}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-field hover:bg-border/60"
            aria-label="Copiar e-mail"
          >
            {copiado === "email" ? <Check size={16} className="text-success" /> : <Copy size={16} />}
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">É o e-mail que o treinador usa para entrar.</p>
      </div>

      {link ? (
        <div className="rounded-xl bg-accent-soft p-3">
          <p className="mb-2 text-sm">
            Link de nova senha, vale até <span className="font-semibold tabular-nums">{validade}</span> e uma vez só:
          </p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={link.url}
              className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-field px-3 text-base text-muted md:text-xs"
              onFocus={(e) => e.target.select()}
            />
            <button
              type="button"
              onClick={() => copiar(link.url, "link")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-field hover:bg-border/60"
              aria-label="Copiar link"
            >
              {copiado === "link" ? <Check size={16} className="text-success" /> : <Copy size={16} />}
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              const texto = `Olá, ${treinador.name}! Para criar uma nova senha no ${campeonatoNome}, abra o link (vale por 48 horas): ${link.url}\nSeu e-mail de acesso: ${treinador.email}`;
              window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
            }}
            className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] text-sm font-semibold text-[#0b2e17] hover:opacity-90"
          >
            <MessageCircle size={18} />
            Enviar no WhatsApp
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted">
          Esqueceu a senha? Gere um link e mande para o treinador. A senha atual continua valendo até ele criar a nova.
        </p>
      )}

      <FormError message={erro} />
      <Button
        type="button"
        variant="secondary"
        disabled={pendente}
        className="self-start"
        onClick={() =>
          iniciar(async () => {
            setErro(null);
            try {
              const r = await gerarLinkSenha(treinador.id);
              setLink({ url: `${window.location.origin}${r.caminho}`, expiraEm: r.expiraEm });
            } catch (e) {
              setErro(e instanceof Error ? e.message : "Não foi possível gerar o link.");
            }
          })
        }
      >
        <KeyRound size={16} className="mr-2 inline" />
        {pendente ? "Gerando..." : link ? "Gerar outro link" : "Gerar link de nova senha"}
      </Button>
    </div>
  );
}
