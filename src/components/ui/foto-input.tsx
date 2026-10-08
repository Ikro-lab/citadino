"use client";

import { useEffect, useRef, useState } from "react";
import type { InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/input";
import { comprimirImagem } from "@/lib/comprimir-imagem";

// A Vercel recusa requisições acima de 4,5MB antes de chegar na server action
// — e a falha cai na página de erro, perdendo o que o atleta digitou. 4MB para
// os arquivos somados deixa folga para os campos de texto do formulário.
const LIMITE_FORM_MB = 4;
const LIMITE_FORM_BYTES = LIMITE_FORM_MB * 1024 * 1024;
const EVENTO_REVALIDAR = "fotoinput:revalidar";

const mb = (bytes: number) => (bytes / 1024 / 1024).toFixed(1).replace(".", ",");

/**
 * Revalida todos os FotoInput do formulário: bloqueia o envio (validação
 * nativa do navegador) enquanto alguma foto está sendo preparada e quando os
 * arquivos somados passam do limite — marcando o maior deles, que é o que o
 * atleta precisa trocar.
 */
function revalidarArquivos(origem: HTMLInputElement) {
  const inputs = origem.form
    ? Array.from(origem.form.querySelectorAll<HTMLInputElement>("input[data-foto-input]"))
    : [origem];

  let total = 0;
  let maior: { input: HTMLInputElement; file: File } | null = null;
  for (const input of inputs) {
    const processando = input.dataset.processando === "1";
    input.setCustomValidity(processando ? "Aguarde a foto ficar pronta para enviar." : "");
    input.dataset.erro = "";

    const file = input.files?.[0];
    if (!file || processando) continue;
    total += file.size;
    if (!maior || file.size > maior.file.size) maior = { input, file };
  }

  if (maior && total > LIMITE_FORM_BYTES) {
    const ehImagem = maior.file.type.startsWith("image/");
    const mensagem = ehImagem
      ? `Os arquivos somam ${mb(total)}MB; o limite é ${LIMITE_FORM_MB}MB. Escolha uma imagem menor ou tire um print dela.`
      : `Este arquivo tem ${mb(maior.file.size)}MB e passa do limite de ${LIMITE_FORM_MB}MB. Envie uma foto do documento em vez do PDF.`;
    maior.input.setCustomValidity(mensagem);
    maior.input.dataset.erro = mensagem;
  }

  (origem.form ?? origem).dispatchEvent(new Event(EVENTO_REVALIDAR));
}

/**
 * Campo de arquivo que reduz a foto no próprio celular assim que ela é
 * escolhida, trocando o arquivo do input pela versão comprimida. O formulário
 * continua enviando normalmente — não muda nada nas server actions.
 */
export function FotoInput(props: Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "onChange">) {
  const ref = useRef<HTMLInputElement>(null);
  const [otimizando, setOtimizando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const input = ref.current;
    const alvo = input?.form ?? input;
    if (!input || !alvo) return;
    const atualizar = () => setErro(input.dataset.erro ?? "");
    alvo.addEventListener(EVENTO_REVALIDAR, atualizar);
    return () => alvo.removeEventListener(EVENTO_REVALIDAR, atualizar);
  }, []);

  return (
    <>
      <Input
        {...props}
        ref={ref}
        type="file"
        data-foto-input=""
        onChange={async (e) => {
          const input = e.currentTarget;
          const original = input.files?.[0];
          if (!original || typeof DataTransfer === "undefined") {
            revalidarArquivos(input);
            return;
          }

          setOtimizando(true);
          input.dataset.processando = "1";
          revalidarArquivos(input);

          const comprimida = await comprimirImagem(original);
          if (comprimida !== original) {
            const dt = new DataTransfer();
            dt.items.add(comprimida);
            input.files = dt.files;
          }

          delete input.dataset.processando;
          revalidarArquivos(input);
          setOtimizando(false);
        }}
      />
      {otimizando && <p className="mt-1 text-xs text-muted">Preparando a foto...</p>}
      {!otimizando && erro && <p className="mt-1 text-xs text-danger">{erro}</p>}
    </>
  );
}
