import { NextResponse } from "next/server";
import { getFeedAgrupado, getFormaRecenteEmLote, todayStr } from "@/lib/partidas";
import { getTenantBySlugOrNull } from "@/lib/tenant";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenant: string }> }
) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlugOrNull(tenantSlug);
  if (!tenant) {
    return NextResponse.json({ error: "tenant_not_found" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const data = searchParams.get("data") || todayStr();
  const soVivo = searchParams.get("vivo") === "1";

  let grupos = await getFeedAgrupado(tenant.id, data);
  if (soVivo) {
    grupos = grupos
      .map((g) => ({ ...g, partidas: g.partidas.filter((p) => p.status === "AO_VIVO") }))
      .filter((g) => g.partidas.length > 0);
  }

  const timeIds = grupos.flatMap((g) => g.partidas.flatMap((p) => [p.timeCasaId, p.timeForaId]));
  const forma = await getFormaRecenteEmLote(tenant.id, timeIds);

  return NextResponse.json({ grupos, forma });
}
