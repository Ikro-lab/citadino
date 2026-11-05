import { NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenant";
import { registrarGolSugerido } from "@/lib/gols-sugeridos";

/**
 * Entrada do monitor da live: um gol visto no placar da transmissão.
 * Protegida por MONITOR_SECRET (Authorization: Bearer ...); sem a variável, fica desligada.
 */
export async function POST(req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const secret = process.env.MONITOR_SECRET;
  if (!secret) return NextResponse.json({ error: "desligado" }, { status: 503 });
  if (req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  const inteiro = (v: unknown) => (typeof v === "number" && Number.isInteger(v) && v >= 0 ? v : null);
  const videoId = typeof body?.videoId === "string" && /^[\w-]{6,20}$/.test(body.videoId) ? body.videoId : null;
  const lado = body?.lado === "casa" || body?.lado === "fora" ? body.lado : null;
  const segundo = inteiro(body?.segundo);
  const placarCasa = inteiro(body?.placarCasa);
  const placarFora = inteiro(body?.placarFora);
  if (!videoId || !lado || segundo === null || placarCasa === null || placarFora === null) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const resultado = await registrarGolSugerido({ tenantId: tenant.id, videoId, lado, segundo, placarCasa, placarFora });
  return NextResponse.json(resultado);
}
