"use client";

import { useState } from "react";
import { Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Compartilha o link do gol no app: no celular abre o menu de compartilhar
 * (WhatsApp, Instagram...); no computador copia o link.
 */
export function CompartilharGol({
  caminho,
  texto,
  className,
}: {
  caminho: string;
  texto: string;
  className?: string;
}) {
  const [copiado, setCopiado] = useState(false);

  async function compartilhar() {
    const url = new URL(caminho, window.location.origin).toString();
    if (navigator.share) {
      // Cancelar o menu também cai aqui; não é erro.
      await navigator.share({ title: texto, text: texto, url }).catch(() => {});
      return;
    }
    try {
      await navigator.clipboard.writeText(`${texto} ${url}`);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    } catch {
      window.prompt("Copie o link do gol:", url);
    }
  }

  return (
    <button
      type="button"
      onClick={compartilhar}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-accent hover:bg-accent-soft",
        className
      )}
    >
      <Share2 size={16} />
      {copiado ? "Link copiado!" : "Compartilhar"}
    </button>
  );
}
