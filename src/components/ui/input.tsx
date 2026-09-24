import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// text-base (16px) no celular: abaixo disso o Safari do iPhone dá zoom ao focar o campo.
const fieldClass =
  "h-11 w-full rounded-lg border border-border bg-background px-3.5 text-base text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-60 md:text-sm";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, inputMode, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      // Teclado só de números no celular para campos numéricos (nº da camisa, minuto, rodada).
      inputMode={inputMode ?? (type === "number" ? "numeric" : undefined)}
      className={cn(
        fieldClass,
        type === "file" &&
          "h-auto py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-foreground",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, ...props }, ref) => (
    <select ref={ref} className={cn(fieldClass, className)} {...props} />
  )
);
Select.displayName = "Select";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
