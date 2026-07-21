import type { Patrocinador } from "@prisma/client";
import { cn } from "@/lib/utils";

const ALTURA_POR_NIVEL: Record<Patrocinador["nivel"], number> = {
  MASTER: 72,
  OURO: 56,
  PRATA: 44,
};

function SponsorLogo({ patrocinador }: { patrocinador: Patrocinador }) {
  const altura = ALTURA_POR_NIVEL[patrocinador.nivel];
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
}: {
  patrocinadores: Patrocinador[];
  className?: string;
}) {
  if (patrocinadores.length === 0) return null;

  return (
    <div className={cn("overflow-hidden py-2", className)}>
      <div className="flex w-max animate-marquee items-center gap-10">
        {[0, 1].map((copia) => (
          <div key={copia} className="flex shrink-0 items-center gap-10" aria-hidden={copia === 1}>
            {patrocinadores.map((p) => (
              <SponsorLogo key={p.id} patrocinador={p} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
