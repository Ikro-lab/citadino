import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { shiftDateStr, todayStr } from "@/lib/partidas";

export function DayNav({
  data,
  categoriaId,
}: {
  data: string;
  categoriaId: string;
}) {
  const prev = shiftDateStr(data, -1);
  const next = shiftDateStr(data, 1);

  const label = new Date(`${data}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });

  const isToday = data === todayStr();

  const hrefFor = (d: string) =>
    `/?${new URLSearchParams({ categoria: categoriaId, data: d }).toString()}`;

  return (
    <div className="flex items-center justify-between">
      <Link
        href={hrefFor(prev)}
        aria-label="Dia anterior"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white hover:bg-surface"
      >
        <ChevronLeft size={20} />
      </Link>

      <div className="text-center">
        <p className="font-semibold capitalize">{label}</p>
        {!isToday && (
          <Link
            href={hrefFor(todayStr())}
            className="text-xs font-medium text-accent"
          >
            Voltar para hoje
          </Link>
        )}
      </div>

      <Link
        href={hrefFor(next)}
        aria-label="Próximo dia"
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-white hover:bg-surface"
      >
        <ChevronRight size={20} />
      </Link>
    </div>
  );
}
