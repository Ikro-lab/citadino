import { startTransition } from "react";
import type { FormEvent } from "react";

/**
 * Envia o formulário sem o reset automático do React 19, que limpa os campos
 * depois de toda action, inclusive quando ela devolve erro. Em formulário com
 * fotos, isso obrigava a escolher todos os arquivos e digitar tudo de novo.
 * Use com `onSubmit` no lugar de `action`; a validação nativa continua valendo.
 */
export function enviarSemLimpar(action: (formData: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(() => action(formData));
  };
}
