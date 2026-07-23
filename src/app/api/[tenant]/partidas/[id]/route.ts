import { NextResponse } from "next/server";
import { getPartidaDetalhe } from "@/lib/partidas";
import { getTenantBySlugOrNull } from "@/lib/tenant";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlugOrNull(tenantSlug);
  if (!tenant) return NextResponse.json({ error: "tenant_not_found" }, { status: 404 });

  const partida = await getPartidaDetalhe(tenant.id, id);
  if (!partida) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
  return NextResponse.json(partida);
}
