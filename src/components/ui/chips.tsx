import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Chips de filtro/aba: um único visual para categorias, datas, "Todos / Ao vivo",
 * abas da partida e menus do painel. Pílulas de 40px: a atual preenchida em tinta, as outras em folha branca.
 */
export function chipClass(ativo: boolean) {
  return cn(
    "inline-flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-medium whitespace-nowrap transition-colors",
    ativo
      ? "bg-foreground text-surface"
      : "bg-surface text-foreground hover:bg-field dark:border dark:border-border"
  );
}

/** Aba sublinhada (seções da partida): texto simples, a atual com traço na cor do campeonato. */
export function tabClass(ativo: boolean) {
  return cn(
    "relative inline-flex h-12 shrink-0 items-center px-3 text-sm font-medium whitespace-nowrap transition-colors",
    "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full",
    ativo ? "text-foreground after:bg-accent" : "text-muted hover:text-foreground"
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
