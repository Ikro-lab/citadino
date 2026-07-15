import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "live" | "success" | "danger" | "accent";

const variantClasses: Record<Variant, string> = {
  neutral: "bg-surface text-muted border border-border",
  live: "bg-accent text-white",
  success: "bg-green-50 text-success border border-green-200",
  danger: "bg-red-50 text-danger border border-red-200",
  accent: "bg-orange-50 text-accent-dark border border-orange-200",
};

export function Badge({
  className,
  variant = "neutral",
  pulse = false,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: Variant; pulse?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse-live" />
      )}
      {children}
    </span>
  );
}
