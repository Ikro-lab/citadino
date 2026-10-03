import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Ícone do app (favicon, tela inicial, PWA): a mesma flâmula que aparece no
// cabeçalho ao lado do nome do campeonato — corpo laranja, faixa verde, haste
// escura e o "C" em Barlow Condensed — sobre um quadrado branco. A flâmula cabe
// na área segura de ícones "maskable" (os 80% centrais), então o Android pode
// recortar em círculo sem cortar nada.
export function BrandIcon({ size, rounded = false }: { size: number; rounded?: boolean }) {
  // Flâmula desenhada num viewBox 28x32; `u` é o tamanho de 1 unidade desse viewBox.
  const flamula = size * 0.6;
  const u = flamula / 28;
  const svgW = flamula;
  const svgH = u * 32;
  const left = (size - svgW) / 2;
  const top = (size - svgH) / 2;

  // Igual ao <text> de components/brand/flamula.tsx: x=14, baseline y=19.5, fontSize=13.
  const fontSize = 13 * u;
  // Barlow Condensed: ascender 1.1 em acima da linha de base, descender 0.3 em abaixo.
  const lineBoxTop = top + 19.5 * u - 1.1 * fontSize;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        position: "relative",
        background: "#ffffff",
        borderRadius: rounded ? size * 0.22 : 0,
      }}
    >
      <svg
        width={svgW}
        height={svgH}
        viewBox="0 0 28 32"
        style={{ position: "absolute", left, top }}
      >
        {/* haste */}
        <rect x="1" y="1" width="26" height="2.5" rx="1.25" fill="#1c2230" />
        {/* corpo da flâmula */}
        <path d="M3 3.5 H25 V12 L14 31 L3 12 Z" fill="#f5821f" />
        {/* faixa */}
        <path d="M3 3.5 H25 V6.5 H3 Z" fill="#2fbf8f" />
      </svg>
      <div
        style={{
          position: "absolute",
          left,
          top: lineBoxTop,
          width: svgW,
          height: 1.4 * fontSize,
          display: "flex",
          justifyContent: "center",
          fontFamily: "Barlow Condensed",
          fontWeight: 800,
          fontSize,
          lineHeight: 1.4,
          color: "#ffffff",
        }}
      >
        C
      </div>
    </div>
  );
}

// Fonte usada no "C" — o gerador de imagem não enxerga a fonte do site.
export async function brandIconFonts() {
  const data = await readFile(join(process.cwd(), "src/app/fonts/BarlowCondensed-ExtraBold.ttf"));
  return [{ name: "Barlow Condensed", data, style: "normal" as const, weight: 800 as const }];
}
