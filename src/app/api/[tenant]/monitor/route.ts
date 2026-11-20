import { NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenant";
import { partidasParaMonitor } from "@/lib/monitor-troca";

/**
 * Para o monitor da live (pasta monitor/): partidas ao vivo com transmissão no
 * YouTube e quando a live começou; em `proximas`, as de hoje ainda agendadas com
 * live, que o monitor reconhece pelos nomes no placar da tela.
 * Protegida por MONITOR_SECRET, como a entrada de gols.
 */
export async function GET(req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const secret = process.env.MONITOR_SECRET;
  if (!secret) return NextResponse.json({ error: "desligado" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  return NextResponse.json(await partidasParaMonitor(tenant.id), { headers: { "Cache-Control": "no-store" } });
}
