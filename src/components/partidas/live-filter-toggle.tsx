import { ChipLink } from "@/components/ui/chips";
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
  const home = paths.home(tenantSlug);

  return (
    <div className="flex gap-2">
      <ChipLink href={`${home}?${new URLSearchParams({ data }).toString()}`} ativo={!vivo}>
        Todos
      </ChipLink>
      <ChipLink href={`${home}?${new URLSearchParams({ data, vivo: "1" }).toString()}`} ativo={vivo}>
        <span
          aria-hidden
          className="h-2 w-2 rounded-full bg-live animate-pulse-live"
        />
        Ao vivo
      </ChipLink>
    </div>
  );
}
