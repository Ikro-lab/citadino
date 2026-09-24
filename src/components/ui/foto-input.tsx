"use client";

import { useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { comprimirImagem } from "@/lib/comprimir-imagem";

/**
 * Campo de arquivo que reduz a foto no próprio celular assim que ela é
 * escolhida, trocando o arquivo do input pela versão comprimida. O formulário
 * continua enviando normalmente — não muda nada nas server actions.
 */
export function FotoInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">) {
  const [otimizando, setOtimizando] = useState(false);

  return (
    <>
      <Input
        {...props}
        type="file"
        onChange={async (e) => {
          const input = e.currentTarget;
          const original = input.files?.[0];
          if (!original || typeof DataTransfer === "undefined") return;

          setOtimizando(true);
          const comprimida = await comprimirImagem(original);
          if (comprimida !== original) {
            const dt = new DataTransfer();
            dt.items.add(comprimida);
            input.files = dt.files;
          }
          setOtimizando(false);
        }}
      />
      {otimizando && <p className="mt-1 text-xs text-muted">Preparando a foto...</p>}
    </>
  );
}
