import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { GolSugeridoCard } from "@/components/partidas/gol-sugerido-card";
import { STATUS_ESPERANDO, buscarGolsSugeridos } from "@/lib/gols-sugeridos";

/**
 * Aba Gols detectados: os gols que o monitor viu no placar da transmissão.
 * Os que esperam (clipe a aprovar ou gol pendente) vêm primeiro; abaixo, os já resolvidos.
 */
export default async function GolsDetectadosPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [pendentes, resolvidos] = await Promise.all([
    buscarGolsSugeridos(db, { status: { in: STATUS_ESPERANDO } }, 50),
    buscarGolsSugeridos(db, { status: { notIn: STATUS_ESPERANDO } }, 20),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Esperando aprovação</h2>
        {pendentes.map(({ sugestao, atletas, autorId }) => (
          <GolSugeridoCard key={sugestao.id} sugestao={sugestao} atletas={atletas} autorId={autorId} tenantSlug={tenantSlug} />
        ))}
        {pendentes.length === 0 && (
          <EmptyState>
            Nenhum gol esperando aprovação. Os gols vistos no placar da transmissão entram na súmula sozinhos, já com o clipe,
            e aparecem aqui para escolher quem fez.
          </EmptyState>
        )}
      </section>

      {resolvidos.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold">Resolvidos recentemente</h2>
          {resolvidos.map(({ sugestao, atletas, autorId }) => (
            <GolSugeridoCard key={sugestao.id} sugestao={sugestao} atletas={atletas} autorId={autorId} tenantSlug={tenantSlug} />
          ))}
        </section>
      )}
    </div>
  );
}
