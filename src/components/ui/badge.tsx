import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Variant = "neutral" | "live" | "success" | "danger" | "accent" | "secondary";

const variantClasses: Record<Variant, string> = {
  neutral: "bg-field text-muted",
  live: "bg-live text-white",
  success: "bg-success/12 text-success",
  danger: "bg-danger/12 text-danger",
  accent: "bg-accent-soft text-accent-dark",
  secondary: "bg-secondary-soft text-secondary",
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap",
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
