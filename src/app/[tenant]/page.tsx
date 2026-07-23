import Link from "next/link";
import { Target, Vote } from "lucide-react";
import { getFeedAgrupado, getFormaRecenteEmLote, todayStr } from "@/lib/partidas";
import { getPatrocinadoresAtivos } from "@/lib/patrocinadores";
import { getTenantBySlug } from "@/lib/tenant";
import { paths } from "@/lib/tenant-path";
import { DateStrip } from "@/components/partidas/date-strip";
import { LiveFilterToggle } from "@/components/partidas/live-filter-toggle";
import { FeedList } from "@/components/partidas/feed-list";
import { BlobBackground } from "@/components/decor/blob-background";

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
  const [forma, patrocinadores] = await Promise.all([
    getFormaRecenteEmLote(tenant.id, timeIds),
    getPatrocinadoresAtivos(tenant.id),
  ]);
  const patrocinadoresFeed = patrocinadores.filter((p) => p.nivel !== "MASTER");

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="relative mb-4 overflow-hidden rounded-xl">
        <BlobBackground />
        <div className="relative px-1 py-1">
          <h1 className="mb-3 text-2xl font-bold">Partidas</h1>
          <div className="flex gap-2">
            <Link
              href={paths.artilharia(tenantSlug)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-border/60"
            >
              <Target size={14} /> Artilharia
            </Link>
            <Link
              href={paths.enquete(tenantSlug)}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-medium hover:bg-border/60"
            >
              <Vote size={14} /> Melhor da rodada
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <DateStrip data={data} vivo={vivo} tenantSlug={tenantSlug} />
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
