// Aparece na hora do toque enquanto a próxima tela carrega (no 4G isso pode
// levar alguns segundos) — sem isso o toque parece não ter funcionado.
export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6" aria-busy="true" aria-label="Carregando">
      <div className="mb-4 h-8 w-40 animate-pulse rounded-lg bg-surface" />
      <div className="mb-4 flex gap-2 overflow-hidden">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="h-11 w-24 shrink-0 animate-pulse rounded-lg bg-surface" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-24 animate-pulse rounded-xl bg-surface" />
        ))}
      </div>
    </div>
  );
}
