/**
 * Formas orgânicas decorativas (laranja/teal/azul-marinho), usadas como fundo
 * sutil atrás de cabeçalhos/heróis. Puramente visual — não interativo.
 */
export function BlobBackground({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible ${className}`}
      viewBox="0 0 400 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <path
        d="M-20 40 C 40 -10, 120 -10, 160 30 C 210 80, 160 120, 100 110 C 40 100, -60 90, -20 40 Z"
        style={{ fill: "var(--color-accent)" }}
        opacity="0.12"
      />
      <path
        d="M220 10 C 280 -20, 380 10, 400 70 C 420 130, 350 150, 300 120 C 250 90, 170 40, 220 10 Z"
        style={{ fill: "var(--color-secondary)" }}
        opacity="0.14"
      />
      <path
        d="M120 90 C 180 70, 260 100, 250 150 C 240 200, 150 210, 110 180 C 70 150, 60 110, 120 90 Z"
        style={{ fill: "var(--color-navy)" }}
        opacity="0.08"
      />
    </svg>
  );
}
