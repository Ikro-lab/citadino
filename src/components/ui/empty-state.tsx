import { cn } from "@/lib/utils";

/** Lista/página sem conteúdo: diz o que falta e, quando dá, o que fazer. */
export function EmptyState({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p
      className={cn(
        "rounded-xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted",
        className
      )}
    >
      {children}
    </p>
  );
}
