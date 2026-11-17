import { NextResponse } from "next/server";
import { getTenantBySlug } from "@/lib/tenant";
import { trocarPartidaPelaTela } from "@/lib/monitor-troca";

/**
 * O monitor viu na live os times de outro jogo de hoje: encerra o que estava ao
 * vivo nessa live e inicia o da tela. Protegida por MONITOR_SECRET.
 * Corpo: { iniciarId, encerrarId?, placarNaTela?: [casa, fora] }.
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
  const id = (v: unknown) => (typeof v === "string" && /^[\w-]{10,40}$/.test(v) ? v : null);
  const iniciarId = id(body?.iniciarId);
  const encerrarId = body?.encerrarId == null ? null : id(body.encerrarId);
  const p = body?.placarNaTela;
  const placarNaTela =
    Array.isArray(p) && p.length === 2 && p.every((n) => Number.isInteger(n) && n >= 0 && n < 100)
      ? ([p[0], p[1]] as [number, number])
      : null;
  if (!iniciarId || (body?.encerrarId != null && !encerrarId)) {
    return NextResponse.json({ error: "dados inválidos" }, { status: 400 });
  }

  const resultado = await trocarPartidaPelaTela(tenant.id, { iniciarId, encerrarId, placarNaTela });
  if ("erro" in resultado) return NextResponse.json({ error: resultado.erro }, { status: 409 });
  return NextResponse.json(resultado);
}
