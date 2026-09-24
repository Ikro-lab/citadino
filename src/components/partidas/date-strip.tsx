"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayStr, shiftDateStr, TIMEZONE, BRT_OFFSET } from "@/lib/date-utils";
import { paths } from "@/lib/tenant-path";
import { centralizarChip } from "@/lib/centralizar-chip";

export function DateStrip({ data, vivo, tenantSlug }: { data: string; vivo: boolean; tenantSlug: string }) {
  const router = useRouter();
  const hoje = todayStr();
  const selectedRef = useRef<HTMLAnchorElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const dias = Array.from({ length: 14 }, (_, i) => shiftDateStr(hoje, i - 3));

  useEffect(() => {
    centralizarChip(selectedRef.current);
  }, [data]);

  // Duas linhas, como num calendário: o dia da semana em cima, o número embaixo.
  function rotulo(d: string) {
    const dt = new Date(`${d}T00:00:00${BRT_OFFSET}`);
    const semana =
      d === hoje
        ? "Hoje"
        : d === shiftDateStr(hoje, -1)
          ? "Ontem"
          : d === shiftDateStr(hoje, 1)
            ? "Amanhã"
            : dt.toLocaleDateString("pt-BR", { weekday: "short", timeZone: TIMEZONE }).replace(".", "");
    const dia = dt.toLocaleDateString("pt-BR", { day: "2-digit", timeZone: TIMEZONE });
    return { semana, dia };
  }

  function hrefFor(d: string) {
    const params = new URLSearchParams({ data: d });
    if (vivo) params.set("vivo", "1");
    return `${paths.home(tenantSlug)}?${params.toString()}`;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
        {dias.map((d) => (
          <Link
            key={d}
            ref={d === data ? selectedRef : undefined}
            href={hrefFor(d)}
            aria-current={d === data ? "date" : undefined}
            className={cn(
              "flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl transition-colors",
              d === data ? "bg-foreground text-surface" : "bg-surface hover:bg-field dark:border dark:border-border"
            )}
          >
            <span className={cn("text-[11px] leading-none capitalize", d === data ? "opacity-80" : "text-muted")}>
              {rotulo(d).semana}
            </span>
            <span className="mt-1 text-base leading-none font-semibold tabular-nums">{rotulo(d).dia}</span>
          </Link>
        ))}
      </div>

      <div className="relative shrink-0">
        <input
          ref={dateInputRef}
          type="date"
          value={data}
          onChange={(e) => {
            if (e.target.value) router.push(hrefFor(e.target.value));
          }}
          className="sr-only"
          tabIndex={-1}
        />
        <button
          type="button"
          onClick={() => dateInputRef.current?.showPicker?.()}
          aria-label="Escolher data"
          className="mb-1 flex h-14 w-11 items-center justify-center rounded-2xl bg-surface text-muted hover:bg-field dark:border dark:border-border"
        >
          <CalendarDays size={18} />
        </button>
      </div>
    </div>
  );
}
