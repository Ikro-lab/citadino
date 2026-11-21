import { NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenant";
import { marcarTempoPelaTela, type FaseNaTela } from "@/lib/monitor-troca";

const FASES: FaseNaTela[] = ["INTERVALO", "SEGUNDO_TEMPO", "FIM"];

/**
 * O monitor viu na live uma mudança de fase do jogo (faixa "INTERVALO", "2T" no
 * placar ou faixa "FIM DE JOGO"): marca no site. Protegida por MONITOR_SECRET.
 * Corpo: { partidaId, fase?: "INTERVALO" | "SEGUNDO_TEMPO" (padrão) | "FIM",
 *   em?: ISO (ou segundoTempoEm), intervaloEm?: ISO, placarNaTela?: [casa, fora] }.
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
  const fase = (body?.fase ?? "SEGUNDO_TEMPO") as FaseNaTela;
  const em = data(body?.em ?? body?.segundoTempoEm) ?? (fase === "FIM" ? new Date() : null);
  const intervaloEm = body?.intervaloEm == null ? null : data(body.intervaloEm);
  const p = body?.placarNaTela;
  const placarNaTela =
    Array.isArray(p) && p.length === 2 && p.every((n) => Number.isInteger(n) && n >= 0 && n < 100)
      ? ([p[0], p[1]] as [number, number])
      : null;
  if (!partidaId || !FASES.includes(fase) || !em || (body?.intervaloEm != null && !intervaloEm)) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const resultado = await marcarTempoPelaTela(tenant.id, { partidaId, fase, em, intervaloEm, placarNaTela });
  if ("erro" in resultado) return NextResponse.json({ error: resultado.erro }, { status: 409 });
  return NextResponse.json(resultado);
}
