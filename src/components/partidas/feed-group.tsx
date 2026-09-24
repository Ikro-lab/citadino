import { ChevronDown } from "lucide-react";

export function FeedGroup({
  categoriaNome,
  children,
}: {
  categoriaNome: string;
  children: React.ReactNode;
}) {
  return (
    <details open className="group overflow-hidden rounded-xl border border-border bg-surface">
      <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
        {categoriaNome}
        <ChevronDown size={18} aria-hidden className="text-muted transition-transform group-open:rotate-180" />
      </summary>
      <div className="bg-background">{children}</div>
    </details>
  );
}
