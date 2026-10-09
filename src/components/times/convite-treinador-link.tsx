"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";

/** Link de cadastro de treinadores de uma categoria, no painel do admin. */
export function ConviteTreinadorLink({ caminho, categoriaNome }: { caminho: string; categoriaNome: string }) {
  const [copiado, setCopiado] = useState(false);

  return (
    <div>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={caminho}
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-field px-3 text-base text-muted md:text-xs"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(`${window.location.origin}${caminho}`);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
          }}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-field hover:bg-border/60"
          aria-label="Copiar link"
        >
          {copiado ? <Check size={16} className="text-success" /> : <Copy size={16} />}
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          const url = `${window.location.origin}${caminho}`;
          const texto = `Cadastro de treinador (${categoriaNome}): crie sua conta e cadastre seu time pelo link: ${url}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
        }}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] text-sm font-semibold text-[#0b2e17] hover:opacity-90"
      >
        <MessageCircle size={18} />
        Enviar no WhatsApp
      </button>
    </div>
  );
}
