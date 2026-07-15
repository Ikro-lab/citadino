import Link from "next/link";
import { cn } from "@/lib/utils";

export function LiveFilterToggle({ data, vivo }: { data: string; vivo: boolean }) {
  const base = "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors";

  return (
    <div className="flex gap-2">
      <Link
        href={`/?${new URLSearchParams({ data }).toString()}`}
        className={cn(base, !vivo ? "bg-accent text-accent-foreground" : "bg-surface text-muted hover:bg-border/60")}
      >
        Todos
      </Link>
      <Link
        href={`/?${new URLSearchParams({ data, vivo: "1" }).toString()}`}
        className={cn(base, vivo ? "bg-accent text-accent-foreground" : "bg-surface text-muted hover:bg-border/60")}
      >
        Ao vivo
      </Link>
    </div>
  );
}
