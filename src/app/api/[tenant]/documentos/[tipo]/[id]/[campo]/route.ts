import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { lerDocumento } from "@/lib/storage";

/**
 * Entrega documento e comprovante de residência de atleta só para quem pode
 * ver: o ADMIN do campeonato (qualquer atleta ou inscrição do tenant) e o
 * TREINADOR dono do time, apenas nas inscrições que ele precisa aprovar —
 * o mesmo que as telas já mostravam a cada um.
 */
const CAMPOS = {
  documento: "documentoUrl",
  comprovante: "comprovanteEnderecoUrl",
} as const;

type Campo = keyof typeof CAMPOS;

const SEM_CACHE = { "Cache-Control": "private, no-store" };

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ tenant: string; tipo: string; id: string; campo: string }> }
) {
  const { tenant: tenantSlug, tipo, id, campo } = await params;

  const session = await auth();
  const user = session?.user;
  if (!user || !user.tenantId || user.tenantSlug !== tenantSlug) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401, headers: SEM_CACHE });
  }
  if (user.role !== "ADMIN" && user.role !== "TREINADOR") {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: SEM_CACHE });
  }
  if (!(campo in CAMPOS) || (tipo !== "atleta" && tipo !== "inscricao")) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: SEM_CACHE });
  }

  const db = getTenantPrisma(user.tenantId);
  const select = {
    documentoUrl: true,
    comprovanteEnderecoUrl: true,
    time: { select: { treinadorId: true } },
  } as const;
  const registro =
    tipo === "atleta"
      ? await db.atleta.findUnique({ where: { id }, select })
      : await db.inscricaoAtleta.findUnique({ where: { id }, select });

  if (!registro) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: SEM_CACHE });
  }

  const podeVer =
    user.role === "ADMIN" || (tipo === "inscricao" && registro.time.treinadorId === user.id);
  if (!podeVer) {
    return NextResponse.json({ error: "forbidden" }, { status: 403, headers: SEM_CACHE });
  }

  const ref = registro[CAMPOS[campo as Campo]];
  const arquivo = ref ? await lerDocumento(ref) : null;
  if (!arquivo) {
    return NextResponse.json({ error: "not_found" }, { status: 404, headers: SEM_CACHE });
  }

  return new NextResponse(arquivo.body as BodyInit, {
    headers: {
      ...SEM_CACHE,
      "Content-Type": arquivo.contentType,
      "Content-Disposition": "inline",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
