import { NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenant";
import { marcarSegundoTempoPelaTela } from "@/lib/monitor-troca";

/**
 * O monitor viu "2T" no placar da live: marca o 2º tempo (e o intervalo, se a
 * mesa não marcou). Protegida por MONITOR_SECRET.
 * Corpo: { partidaId, segundoTempoEm: ISO, intervaloEm?: ISO }.
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
  const data = (v: unknown) => {
    if (typeof v !== "string") return null;
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  };
  const partidaId = typeof body?.partidaId === "string" && /^[\w-]{10,40}$/.test(body.partidaId) ? body.partidaId : null;
  const segundoTempoEm = data(body?.segundoTempoEm);
  const intervaloEm = body?.intervaloEm == null ? null : data(body.intervaloEm);
  if (!partidaId || !segundoTempoEm || (body?.intervaloEm != null && !intervaloEm)) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const resultado = await marcarSegundoTempoPelaTela(tenant.id, { partidaId, segundoTempoEm, intervaloEm });
  if ("erro" in resultado) return NextResponse.json({ error: resultado.erro }, { status: 409 });
  return NextResponse.json(resultado);
}
