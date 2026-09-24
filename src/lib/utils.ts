import { extendTailwindMerge } from "tailwind-merge";

// Ensina ao merge os tokens de cor do tema, para "bg-field" substituir "bg-surface" etc.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      color: [
        "background", "surface", "field", "foreground", "muted", "border", "live",
        "accent", "accent-foreground", "accent-dark", "accent-soft",
        "secondary", "secondary-foreground", "secondary-soft",
        "navy", "navy-foreground", "success", "danger", "warning",
      ],
    },
  },
});

/** Junta classes resolvendo conflitos: a última vence (ex: "p-4" + "p-0" = "p-0"). */
export function cn(...classes: Array<string | false | null | undefined>) {
  return twMerge(classes.filter(Boolean).join(" "));
}

export function calcularIdade(dataNascimento: Date) {
  const hoje = new Date();
  let idade = hoje.getFullYear() - dataNascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < dataNascimento.getMonth() ||
    (hoje.getMonth() === dataNascimento.getMonth() && hoje.getDate() < dataNascimento.getDate());
  if (aindaNaoFezAniversario) idade -= 1;
  return idade;
}
