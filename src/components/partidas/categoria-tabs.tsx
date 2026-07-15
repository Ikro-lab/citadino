import Link from "next/link";
import { cn } from "@/lib/utils";

export function CategoriaTabs({
  categorias,
  categoriaId,
  basePath,
  extraParams,
}: {
  categorias: { id: string; label: string }[];
  categoriaId: string | null;
  basePath: string;
  extraParams?: Record<string, string>;
}) {
  if (categorias.length === 0) return null;

  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
      {categorias.map((c) => {
        const params = new URLSearchParams({ ...extraParams, categoria: c.id });
        return (
          <Link
            key={c.id}
            href={`${basePath}?${params.toString()}`}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              c.id === categoriaId
                ? "border-accent bg-accent text-white"
                : "border-border bg-white text-foreground hover:bg-surface"
            )}
          >
            {c.label}
          </Link>
        );
      })}
    </div>
  );
}
