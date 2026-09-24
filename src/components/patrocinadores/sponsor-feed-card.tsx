import type { Patrocinador } from "@prisma/client";

export function SponsorFeedCard({ patrocinador }: { patrocinador: Patrocinador }) {
  const conteudo = (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-muted">
        Patrocínio
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={patrocinador.logoUrl}
        alt={patrocinador.nome}
        className="h-14 w-auto max-w-[60%] object-contain sm:h-18"
      />
    </div>
  );

  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3">
      {patrocinador.linkUrl ? (
        <a href={patrocinador.linkUrl} target="_blank" rel="noopener noreferrer sponsored">
          {conteudo}
        </a>
      ) : (
        conteudo
      )}
    </div>
  );
}
