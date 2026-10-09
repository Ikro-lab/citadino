import { getDiasComJogo, getFeedAgrupado, getFormaRecenteEmLote, todayStr } from "@/lib/partidas";
import { diasDaFaixa } from "@/lib/date-utils";
import { getPatrocinadoresAtivos } from "@/lib/patrocinadores";
import { getTenantBySlug } from "@/lib/tenant";
import { DateStrip } from "@/components/partidas/date-strip";
import { LiveFilterToggle } from "@/components/partidas/live-filter-toggle";
import { FeedList } from "@/components/partidas/feed-list";
import { PageHeader } from "@/components/ui/page-header";

export default async function HomePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ data?: string; vivo?: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const sp = await searchParams;
  const data = sp.data || todayStr();
  const vivo = sp.vivo === "1";

  let grupos = await getFeedAgrupado(tenant.id, data);
  if (vivo) {
    grupos = grupos
      .map((g) => ({ ...g, partidas: g.partidas.filter((p) => p.status === "AO_VIVO") }))
      .filter((g) => g.partidas.length > 0);
  }

  const timeIds = grupos.flatMap((g) => g.partidas.flatMap((p) => [p.timeCasaId, p.timeForaId]));
  const faixa = diasDaFaixa(todayStr());
  const [forma, patrocinadores, diasComJogo] = await Promise.all([
    getFormaRecenteEmLote(tenant.id, timeIds),
    getPatrocinadoresAtivos(tenant.id),
    getDiasComJogo(tenant.id, faixa[0], faixa[faixa.length - 1]),
  ]);
  const patrocinadoresFeed = patrocinadores.filter((p) => p.nivel !== "MASTER");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader title="Partidas" />

      <div className="flex flex-col gap-3">
        <DateStrip data={data} vivo={vivo} tenantSlug={tenantSlug} diasComJogo={diasComJogo} />
        <LiveFilterToggle data={data} vivo={vivo} tenantSlug={tenantSlug} />
        <FeedList
          initialGrupos={grupos}
          initialForma={forma}
          data={data}
          vivo={vivo}
          patrocinadores={patrocinadoresFeed}
          tenantSlug={tenantSlug}
        />
      </div>
    </div>
  );
}
