import type { Tenant } from "@prisma/client";
import { getPatrocinadoresAtivos } from "@/lib/patrocinadores";
import { SponsorStrip } from "./sponsor-strip";

export async function SponsorFooter({
  tenantId,
  animado = true,
  tamanho = "MEDIO",
}: {
  tenantId: string;
  animado?: boolean;
  tamanho?: Tenant["patrocinadoresTamanho"];
}) {
  const patrocinadores = await getPatrocinadoresAtivos(tenantId);
  if (patrocinadores.length === 0) return null;

  return (
    <footer className="border-t border-border bg-surface/50 pb-20 md:pb-0">
      <div className="mx-auto max-w-5xl">
        <p className="px-4 pt-3 text-center text-[11px] font-semibold tracking-wide text-muted uppercase">
          Patrocinadores
        </p>
        <SponsorStrip
          patrocinadores={patrocinadores}
          className="justify-center"
          animado={animado}
          tamanho={tamanho}
        />
      </div>
    </footer>
  );
}
