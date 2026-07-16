function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function initials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0][0];
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

export function AtletaAvatar({
  nome,
  fotoUrl,
  size = 40,
  className = "",
}: {
  nome: string;
  fotoUrl?: string | null;
  size?: number;
  className?: string;
}) {
  if (fotoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={fotoUrl}
        alt={nome}
        width={size}
        height={size}
        style={{ width: size, height: size }}
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  const hue = hashString(nome) % 360;

  return (
    <div
      aria-hidden
      style={{ width: size, height: size, backgroundColor: `hsl(${hue}, 55%, 42%)` }}
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${className}`}
    >
      <span style={{ fontSize: size * 0.4 }}>{initials(nome)}</span>
    </div>
  );
}
