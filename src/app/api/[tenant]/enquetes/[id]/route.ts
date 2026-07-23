import { NextResponse } from "next/server";
import { getTenantBySlugOrNull } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlugOrNull(tenantSlug);
  if (!tenant) return NextResponse.json({ error: "tenant_not_found" }, { status: 404 });

  const db = getTenantPrisma(tenant.id);
  const enquete = await db.enquete.findUnique({
    where: { id },
    include: {
      opcoes: {
        include: {
          atleta: { select: { nome: true, time: { select: { nome: true } } } },
          _count: { select: { votos: true } },
        },
      },
    },
  });

  if (!enquete) return NextResponse.json({ error: "not_found" }, { status: 404 });

  return NextResponse.json({
    id: enquete.id,
    ativa: enquete.ativa,
    opcoes: enquete.opcoes.map((o) => ({
      id: o.id,
      atletaNome: o.atleta.nome,
      timeNome: o.atleta.time.nome,
      votos: o._count.votos,
    })),
  });
}
