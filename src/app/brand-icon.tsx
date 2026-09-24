// Ícone do app (favicon, tela inicial, PWA): a flâmula do Citadino num
// quadrado laranja. Cabe na área segura de ícones "maskable" (os 80% centrais),
// então o Android pode recortar em círculo sem cortar a flâmula.
export function BrandIcon({ size, rounded = false }: { size: number; rounded?: boolean }) {
  const flamula = size * 0.62;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5821f",
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <svg width={flamula} height={(flamula * 32) / 28} viewBox="0 0 28 32">
        <rect x="1" y="1" width="26" height="2.5" rx="1.25" fill="#1e2a4a" />
        <path d="M3 3.5 H25 V12 L14 31 L3 12 Z" fill="#ffffff" />
        <path d="M3 3.5 H25 V6.5 H3 Z" fill="#2fbf8f" />
        {/* "C" desenhado como traço — o gerador de ícone não tem fonte em negrito */}
        <path
          d="M17.1 12.3 A4.8 4.8 0 1 0 17.1 19.7"
          fill="none"
          stroke="#f5821f"
          strokeWidth="2.8"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
