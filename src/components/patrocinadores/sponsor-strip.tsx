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
}: {
  patrocinador: Patrocinador;
  escala: number;
}) {
  const altura = ALTURA_POR_NIVEL[patrocinador.nivel] * escala;
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={patrocinador.logoUrl}
      alt={patrocinador.nome}
      style={{ height: altura, width: "auto" }}
      className="shrink-0 object-contain transition hover:scale-105"
    />
  );

  if (!patrocinador.linkUrl) return img;

  return (
    <a
      href={patrocinador.linkUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      title={patrocinador.nome}
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
}: {
  patrocinadores: Patrocinador[];
  className?: string;
  animado?: boolean;
  tamanho?: Tenant["patrocinadoresTamanho"];
}) {
  if (patrocinadores.length === 0) return null;

  const escala = ESCALA_POR_TAMANHO[tamanho];

  if (!animado) {
    return (
      <div className={cn("overflow-hidden py-2", className)}>
        <div className="flex flex-wrap items-center justify-center gap-10">
          {patrocinadores.map((p) => (
            <SponsorLogo key={p.id} patrocinador={p} escala={escala} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden py-2", className)}>
      <div className="flex w-max animate-marquee items-center gap-10">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex shrink-0 items-center gap-10" aria-hidden={copia === 1}>
            {patrocinadores.map((p) => (
              <SponsorLogo key={p.id} patrocinador={p} escala={escala} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
