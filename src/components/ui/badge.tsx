import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "live" | "success" | "danger" | "accent" | "secondary";

const variantClasses: Record<Variant, string> = {
  neutral: "bg-surface text-muted border border-border",
  live: "bg-accent text-accent-foreground",
  success: "bg-success/10 text-success border border-success/20",
  danger: "bg-danger/10 text-danger border border-danger/20",
  accent: "bg-accent-soft text-accent-dark border border-accent/20",
  secondary: "bg-secondary-soft text-secondary border border-secondary/20",
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
        "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide",
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
