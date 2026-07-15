export function FeedGroup({
  categoriaNome,
  children,
}: {
  categoriaNome: string;
  children: React.ReactNode;
}) {
  return (
    <details open className="group overflow-hidden rounded-xl border border-border bg-surface">
      <summary className="flex cursor-pointer list-none items-center justify-between px-3 py-2.5 text-sm font-bold">
        {categoriaNome}
        <span className="text-muted transition-transform group-open:rotate-180">▾</span>
      </summary>
      <div className="bg-background">{children}</div>
    </details>
  );
}
