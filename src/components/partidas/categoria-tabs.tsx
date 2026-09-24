import { ChipLink, ChipRow } from "@/components/ui/chips";

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
    <ChipRow>
      {categorias.map((c) => {
        const params = new URLSearchParams({ ...extraParams, categoria: c.id });
        return (
          <ChipLink key={c.id} href={`${basePath}?${params.toString()}`} ativo={c.id === categoriaId}>
            {c.label}
          </ChipLink>
        );
      })}
    </ChipRow>
  );
}
