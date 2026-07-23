"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { todayStr, shiftDateStr, TIMEZONE, BRT_OFFSET } from "@/lib/date-utils";
import { paths } from "@/lib/tenant-path";

export function DateStrip({ data, vivo, tenantSlug }: { data: string; vivo: boolean; tenantSlug: string }) {
  const router = useRouter();
  const hoje = todayStr();
  const selectedRef = useRef<HTMLAnchorElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const dias = Array.from({ length: 14 }, (_, i) => shiftDateStr(hoje, i - 3));

  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [data]);

  function label(d: string) {
    if (d === hoje) return "Hoje";
    if (d === shiftDateStr(hoje, -1)) return "Ontem";
    if (d === shiftDateStr(hoje, 1)) return "Amanhã";
    return new Date(`${d}T00:00:00${BRT_OFFSET}`).toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      timeZone: TIMEZONE,
    });
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
            className={cn(
              "shrink-0 rounded-lg border px-3 py-2 text-center text-xs font-semibold capitalize whitespace-nowrap transition-colors",
              d === data
                ? "border-accent bg-accent text-accent-foreground"
                : "border-border bg-surface text-foreground hover:bg-border/60"
            )}
          >
            {label(d)}
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
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-muted hover:bg-border/60"
        >
          <CalendarDays size={16} />
        </button>
      </div>
    </div>
  );
}
