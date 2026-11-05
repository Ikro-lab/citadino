import { NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { extrairYoutubeId } from "@/lib/youtube";

/**
 * Para o monitor da live (pasta monitor/): partidas ao vivo com transmissão no
 * YouTube e quando a live começou. Protegida por MONITOR_SECRET, como a entrada de gols.
 */
export async function GET(req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const secret = process.env.MONITOR_SECRET;
  if (!secret) return NextResponse.json({ error: "desligado" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);
  const partidas = await db.partida.findMany({
    where: { status: "AO_VIVO", linkTransmissaoUrl: { not: null } },
    orderBy: { iniciadaEm: "desc" },
    select: {
      id: true,
      linkTransmissaoUrl: true,
      transmissaoInicioEm: true,
      timeCasa: { select: { nome: true } },
      timeFora: { select: { nome: true } },
    },
  });

  return NextResponse.json(
    {
      partidas: partidas
        .map((p) => ({
          id: p.id,
          videoId: extrairYoutubeId(p.linkTransmissaoUrl),
          transmissaoInicioEm: p.transmissaoInicioEm,
          jogo: `${p.timeCasa.nome} x ${p.timeFora.nome}`,
        }))
        .filter((p) => p.videoId),
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}
