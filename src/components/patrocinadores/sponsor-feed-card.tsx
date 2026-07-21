import type { Patrocinador } from "@prisma/client";

export function SponsorFeedCard({ patrocinador }: { patrocinador: Patrocinador }) {
  const conteudo = (
    <div className="flex items-center justify-between gap-3">
      <span className="text-[11px] font-semibold tracking-wide text-muted uppercase">
        Patrocínio
      </span>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={patrocinador.logoUrl}
        alt={patrocinador.nome}
        style={{ height: 36, width: "auto" }}
        className="object-contain"
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
