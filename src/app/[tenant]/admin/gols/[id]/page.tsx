import Link from "next/link";
import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { GolSugeridoCard } from "@/components/partidas/gol-sugerido-card";
import { paths } from "@/lib/tenant-path";
import { buscarGolsSugeridos } from "@/lib/gols-sugeridos";

/** Gol visto no placar da live, aberto pela notificação. */
export default async function GolSugeridoPage({ params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const [item] = await buscarGolsSugeridos(getTenantPrisma(tenant.id), { id });
  if (!item) notFound();

  return (
    <div className="flex flex-col gap-4">
      <Link href={paths.admin.golsSugeridos(tenantSlug)} className="text-sm font-semibold text-accent hover:underline">
        ← Todos os gols detectados
      </Link>
      <GolSugeridoCard sugestao={item.sugestao} atletas={item.atletas} tenantSlug={tenantSlug} />
    </div>
  );
}
