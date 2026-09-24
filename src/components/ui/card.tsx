import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

/** Folha de conteúdo: branca sobre o fundo cinza, sem sombra. Borda só no tema escuro. */
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl bg-surface p-4 dark:border dark:border-border", className)}
      {...props}
    />
  );
}
