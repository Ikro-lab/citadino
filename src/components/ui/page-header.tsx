import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-center justify-between gap-3", className)}>
      <h1 className="font-display text-3xl font-bold leading-none tracking-tight">{title}</h1>
      {action}
    </div>
  );
}
