import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { EmptyState } from "@/components/ui/empty-state";
import { GolSugeridoCard } from "@/components/partidas/gol-sugerido-card";
import { buscarGolsSugeridos } from "@/lib/gols-sugeridos";

/**
 * Aba Gols detectados: os gols que o monitor viu no placar da transmissão.
 * O gol que bate com o placar do site entra sozinho na súmula e fica aqui até
 * alguém escolher o autor (ou anular). A leitura que não bate espera aprovação.
 * Abaixo, os já resolvidos.
 */
export default async function GolsDetectadosPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [semAutor, pendentes, resolvidos] = await Promise.all([
    buscarGolsSugeridos(db, { status: "AUTOMATICO" }, 50),
    buscarGolsSugeridos(db, { status: "PENDENTE" }, 50),
    buscarGolsSugeridos(db, { status: { notIn: ["PENDENTE", "AUTOMATICO"] } }, 20),
  ]);

  return (
    <div className="flex flex-col gap-6">
      {semAutor.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-semibold">Lançados pela transmissão: falta o autor</h2>
          {semAutor.map(({ sugestao, atletas }) => (
            <GolSugeridoCard key={sugestao.id} sugestao={sugestao} atletas={atletas} tenantSlug={tenantSlug} />
          ))}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="font-semibold">Esperando aprovação</h2>
        {pendentes.map(({ sugestao, atletas }) => (
          <GolSugeridoCard key={sugestao.id} sugestao={sugestao} atletas={atletas} tenantSlug={tenantSlug} />
        ))}
        {pendentes.length === 0 && (
          <EmptyState>Nenhum gol esperando aprovação. Aparece aqui o gol da transmissão que não bate com o placar do site.</EmptyState>
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
