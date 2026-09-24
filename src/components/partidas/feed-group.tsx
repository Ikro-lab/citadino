import { ChevronDown } from "lucide-react";

export function FeedGroup({
  categoriaNome,
  total,
  children,
}: {
  categoriaNome: string;
  total: number;
  children: React.ReactNode;
}) {
  return (
    <details open className="group overflow-hidden rounded-2xl bg-surface dark:border dark:border-border">
      <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 [&::-webkit-details-marker]:hidden">
        <span className="h-4 w-1 shrink-0 rounded-full bg-accent" aria-hidden />
        <span className="flex-1 truncate text-sm font-semibold">{categoriaNome}</span>
        <span className="text-xs text-muted tabular-nums">
          {total} {total === 1 ? "jogo" : "jogos"}
        </span>
        <ChevronDown size={18} aria-hidden className="text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="border-t border-border">{children}</div>
    </details>
  );
}
