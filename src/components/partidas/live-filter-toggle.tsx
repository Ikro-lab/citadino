import Link from "next/link";
import { cn } from "@/lib/utils";
import { paths } from "@/lib/tenant-path";

export function LiveFilterToggle({
  data,
  vivo,
  tenantSlug,
}: {
  data: string;
  vivo: boolean;
  tenantSlug: string;
}) {
  const base = "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors";
  const home = paths.home(tenantSlug);

  return (
    <div className="flex gap-2">
      <Link
        href={`${home}?${new URLSearchParams({ data }).toString()}`}
        className={cn(base, !vivo ? "bg-accent text-accent-foreground" : "bg-surface text-muted hover:bg-border/60")}
      >
        Todos
      </Link>
      <Link
        href={`${home}?${new URLSearchParams({ data, vivo: "1" }).toString()}`}
        className={cn(base, vivo ? "bg-accent text-accent-foreground" : "bg-surface text-muted hover:bg-border/60")}
      >
        Ao vivo
      </Link>
    </div>
  );
}
