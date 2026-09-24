import { cn } from "@/lib/utils";

export function FormError({ message, className }: { message?: string | null; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger", className)}>
      {message}
    </p>
  );
}

/** Erro de um campo específico, logo abaixo do input. */
export function FieldError({ errors }: { errors?: string[] }) {
  if (!errors?.length) return null;
  return <p className="mt-1 text-xs text-danger">{errors[0]}</p>;
}
