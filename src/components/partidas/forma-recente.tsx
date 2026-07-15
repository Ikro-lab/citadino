const corPorResultado: Record<"V" | "E" | "D", string> = {
  V: "bg-success",
  E: "bg-muted",
  D: "bg-danger",
};

export function FormaRecente({ resultados }: { resultados: ("V" | "E" | "D")[] }) {
  if (resultados.length === 0) return null;

  return (
    <span className="flex items-center gap-0.5" aria-label="Forma recente">
      {resultados.map((r, i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${corPorResultado[r]}`} />
      ))}
    </span>
  );
}
