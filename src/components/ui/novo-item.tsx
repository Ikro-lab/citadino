import { Plus, ChevronDown } from "lucide-react";

/**
 * Formulário de criação recolhido atrás de um botão, para a lista (o que se
 * usa todo dia) aparecer primeiro no celular. Abre sozinho quando a lista está vazia.
 */
export function NovoItem({
  titulo,
  aberto = false,
  children,
}: {
  titulo: string;
  aberto?: boolean;
  children: React.ReactNode;
}) {
  return (
    <details open={aberto} className="group rounded-2xl bg-surface dark:border dark:border-border">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold text-accent select-none [&::-webkit-details-marker]:hidden">
        <Plus size={18} className="shrink-0" />
        <span className="flex-1">{titulo}</span>
        <ChevronDown size={18} className="shrink-0 text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-4 pb-4">{children}</div>
    </details>
  );
}
