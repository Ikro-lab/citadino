import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { GolSugeridoCard } from "@/components/partidas/gol-sugerido-card";
import { buscarGolsSugeridos } from "@/lib/gols-sugeridos";

/**
 * Aba Gols detectados: os gols que o monitor viu no placar da transmissão.
 * Os pendentes vêm primeiro, para aprovar com o autor; abaixo, os já resolvidos.
 */
export default async function GolsDetectadosPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [pendentes, resolvidos] = await Promise.all([
    buscarGolsSugeridos(db, { status: "PENDENTE" }, 50),
    buscarGolsSugeridos(db, { status: { not: "PENDENTE" } }, 20),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Esperando aprovação</h2>
        {pendentes.map(({ sugestao, atletas }) => (
          <GolSugeridoCard key={sugestao.id} sugestao={sugestao} atletas={atletas} tenantSlug={tenantSlug} />
        ))}
        {pendentes.length === 0 && (
          <EmptyState>Nenhum gol esperando aprovação. Os gols vistos no placar da transmissão aparecem aqui.</EmptyState>
        )}
      </section>

      {resolvidos.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold">Resolvidos recentemente</h2>
          {resolvidos.map(({ sugestao, atletas }) => (
            <GolSugeridoCard key={sugestao.id} sugestao={sugestao} atletas={atletas} tenantSlug={tenantSlug} />
          ))}
        </section>
      )}
    </div>
  );
}
