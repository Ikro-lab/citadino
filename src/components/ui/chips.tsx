import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Chips de filtro/aba: um único visual para categorias, datas, "Todos / Ao vivo",
 * abas da partida e menus do painel. Altura de 44px para o toque no celular.
 */
export function chipClass(ativo: boolean) {
  return cn(
    "inline-flex h-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border px-4 text-sm font-semibold whitespace-nowrap transition-colors",
    ativo
      ? "border-accent bg-accent text-accent-foreground"
      : "border-border bg-surface text-foreground hover:bg-border/60"
  );
}

/** Linha de chips com rolagem horizontal que encosta nas bordas da tela. */
export function ChipRow({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn("-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]", className)}>
      {children}
    </div>
  );
}

export function ChipLink({
  href,
  ativo,
  className,
  children,
}: {
  href: string;
  ativo: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} aria-current={ativo ? "page" : undefined} className={cn(chipClass(ativo), className)}>
      {children}
    </Link>
  );
}
