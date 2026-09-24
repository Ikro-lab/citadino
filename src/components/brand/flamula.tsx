/**
 * Marca do campeonato: uma flâmula (a bandeirinha triangular pendurada em
 * vestiário e arquibancada de várzea) com a inicial do nome. Usa as cores do
 * tenant (accent/secondary), então cada campeonato ganha a sua.
 */
export function Flamula({
  nome,
  size = 28,
  className = "",
}: {
  nome: string;
  size?: number;
  className?: string;
}) {
  const inicial = nome.trim().charAt(0).toUpperCase() || "C";

  return (
    <svg
      width={size}
      height={(size * 32) / 28}
      viewBox="0 0 28 32"
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    >
      {/* haste */}
      <rect x="1" y="1" width="26" height="2.5" rx="1.25" style={{ fill: "var(--color-foreground)" }} />
      {/* corpo da flâmula */}
      <path d="M3 3.5 H25 V12 L14 31 L3 12 Z" style={{ fill: "var(--color-accent)" }} />
      {/* faixa */}
      <path d="M3 3.5 H25 V6.5 H3 Z" style={{ fill: "var(--color-secondary)" }} />
      <text
        x="14"
        y="19.5"
        textAnchor="middle"
        fontSize="13"
        fontWeight="800"
        style={{ fill: "var(--color-accent-foreground)", fontFamily: "var(--font-barlow-condensed)" }}
      >
        {inicial}
      </text>
    </svg>
  );
}
