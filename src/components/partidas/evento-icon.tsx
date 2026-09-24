import { Goal, ArrowLeftRight, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

/** Cartão de árbitro desenhado (em vez de emoji/quadrado genérico). */
export function CartaoIcon({ cor, className }: { cor: "amarelo" | "vermelho"; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "inline-block h-3.5 w-2.5 shrink-0 rounded-[2px]",
        cor === "amarelo" ? "bg-warning" : "bg-danger",
        className
      )}
    />
  );
}

export function EventoIcon({ tipo, className }: { tipo: string; className?: string }) {
  switch (tipo) {
    case "GOL":
      return <Goal size={16} aria-hidden className={cn("shrink-0 text-accent", className)} />;
    case "CARTAO_AMARELO":
      return <CartaoIcon cor="amarelo" className={className} />;
    case "CARTAO_VERMELHO":
      return <CartaoIcon cor="vermelho" className={className} />;
    case "SUBSTITUICAO":
      return <ArrowLeftRight size={16} aria-hidden className={cn("shrink-0 text-muted", className)} />;
    default:
      return <Circle size={16} aria-hidden className={cn("shrink-0 text-muted", className)} />;
  }
}
