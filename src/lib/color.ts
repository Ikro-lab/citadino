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

const TEXTO_ESCURO = "#12141c";
const TEXTO_CLARO = "#ffffff";

/** Luminância relativa do WCAG 2.x (canais linearizados do sRGB). */
function luminanciaRelativa(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  const lin = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Razão de contraste do WCAG entre duas cores (1 a 21). */
export function contrastRatio(a: string, b: string) {
  const [l1, l2] = [luminanciaRelativa(a), luminanciaRelativa(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Texto escuro ou branco: o que tiver a maior razão de contraste WCAG sobre a
 * cor base. Para quase todas as cores um dos dois passa de 4,5:1 (WCAG AA);
 * os tons médios (ex.: #448855) ficam perto de 4,3:1, acima do 3:1 de texto grande.
 */
function contrastForeground(hex: string) {
  return contrastRatio(hex, TEXTO_ESCURO) >= contrastRatio(hex, TEXTO_CLARO) ? TEXTO_ESCURO : TEXTO_CLARO;
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
