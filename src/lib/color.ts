export function isValidHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

function rgbToHex({ r, g, b }: { r: number; g: number; b: number }) {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)].map((v) => v.toString(16).padStart(2, "0")).join("")
  );
}

/** Mistura `hex` com branco (ratio > 0) ou preto (ratio < 0). ratio em [-1, 1]. */
function mix(hex: string, ratio: number) {
  const { r, g, b } = hexToRgb(hex);
  const target = ratio >= 0 ? 255 : 0;
  const amount = Math.abs(ratio);
  return rgbToHex({
    r: r + (target - r) * amount,
    g: g + (target - g) * amount,
    b: b + (target - b) * amount,
  });
}

/** Preto ou branco — o que der mais contraste em cima da cor base (fórmula de luminância relativa, W3C). */
function contrastForeground(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#12141c" : "#ffffff";
}

export type ColorVariants = {
  base: string;
  foreground: string;
  darkVariant: string;
  soft: string;
};

/**
 * Deriva as variantes usadas hoje em globals.css (`--accent`, `--accent-dark`,
 * `--accent-soft`, `--accent-foreground`) a partir de uma única cor base,
 * uma para o tema claro e outra pro escuro (mesmo tom, ajuste de luminosidade
 * diferente pra continuar legível nos dois).
 */
export function deriveThemeVariants(base: string) {
  return {
    light: {
      base,
      foreground: contrastForeground(base),
      darkVariant: mix(base, -0.15),
      soft: mix(base, 0.88),
    } satisfies ColorVariants,
    dark: {
      base,
      foreground: contrastForeground(base),
      darkVariant: mix(base, 0.2),
      soft: mix(base, -0.82),
    } satisfies ColorVariants,
  };
}
