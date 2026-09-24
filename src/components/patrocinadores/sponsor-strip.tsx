import type { CSSProperties } from "react";
import type { Patrocinador, Tenant } from "@prisma/client";
import { cn } from "@/lib/utils";

const ALTURA_POR_NIVEL: Record<Patrocinador["nivel"], number> = {
  MASTER: 112,
  OURO: 88,
  PRATA: 68,
};

const ESCALA_POR_TAMANHO: Record<Tenant["patrocinadoresTamanho"], number> = {
  PEQUENO: 0.7,
  MEDIO: 1,
  GRANDE: 1.4,
};

function SponsorLogo({
  patrocinador,
  escala,
  alturaMaxMobile,
}: {
  patrocinador: Patrocinador;
  escala: number;
  alturaMaxMobile?: number;
}) {
  const altura = ALTURA_POR_NIVEL[patrocinador.nivel] * escala;
  const alturaMobile = alturaMaxMobile ? Math.min(altura, alturaMaxMobile) : altura;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={patrocinador.logoUrl}
      alt={patrocinador.nome}
      style={{ "--h": `${altura}px`, "--h-mobile": `${alturaMobile}px` } as CSSProperties}
      className="h-(--h-mobile) w-auto shrink-0 object-contain transition hover:scale-105 md:h-(--h)"
    />
  );

  if (!patrocinador.linkUrl) return img;

  return (
    <a
      href={patrocinador.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      title={patrocinador.nome}
      className="shrink-0"
    >
      {img}
    </a>
  );
}

export function SponsorStrip({
  patrocinadores,
  className,
  animado = true,
  tamanho = "MEDIO",
  alturaMaxMobile,
}: {
  patrocinadores: Patrocinador[];
  className?: string;
  animado?: boolean;
  tamanho?: Tenant["patrocinadoresTamanho"];
  /** Limita a altura dos logos no celular (ex: faixa do topo, pra não empurrar o conteúdo). */
  alturaMaxMobile?: number;
}) {
  if (patrocinadores.length === 0) return null;

  const escala = ESCALA_POR_TAMANHO[tamanho];

  if (!animado) {
    return (
      <div className={cn("overflow-hidden py-2", className)}>
        <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
          {patrocinadores.map((p) => (
            <SponsorLogo key={p.id} patrocinador={p} escala={escala} alturaMaxMobile={alturaMaxMobile} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden py-2", className)}>
      <div className="flex w-max animate-marquee items-center gap-6 md:gap-10">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex shrink-0 items-center gap-6 md:gap-10" aria-hidden={copia === 1}>
            {patrocinadores.map((p) => (
              <SponsorLogo key={p.id} patrocinador={p} escala={escala} alturaMaxMobile={alturaMaxMobile} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
