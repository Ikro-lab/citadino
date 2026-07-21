import type { Patrocinador } from "@prisma/client";
import { cn } from "@/lib/utils";

const ALTURA_POR_NIVEL: Record<Patrocinador["nivel"], number> = {
  MASTER: 40,
  OURO: 30,
  PRATA: 24,
};

function SponsorLogo({ patrocinador }: { patrocinador: Patrocinador }) {
  const altura = ALTURA_POR_NIVEL[patrocinador.nivel];
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={patrocinador.logoUrl}
      alt={patrocinador.nome}
      style={{ height: altura, width: "auto" }}
      className="shrink-0 object-contain grayscale transition hover:grayscale-0"
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
    <div
      className={cn(
        "flex items-center gap-5 overflow-x-auto px-4 py-2 [scrollbar-width:none]",
        className
      )}
    >
      {patrocinadores.map((p) => (
        <SponsorLogo key={p.id} patrocinador={p} />
      ))}
    </div>
  );
}
