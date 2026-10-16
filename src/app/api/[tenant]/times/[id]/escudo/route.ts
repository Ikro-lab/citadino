import { NextResponse } from "next/server";
import { getTenantBySlugOrNull } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";

/**
 * Baixa o escudo do time como arquivo. A imagem já é pública (aparece no
 * site), mas fica em outro domínio (Vercel Blob), onde o atributo `download`
 * do link é ignorado — por isso ela passa por aqui.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ tenant: string; id: string }> }
) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlugOrNull(tenantSlug);
  if (!tenant) return NextResponse.json({ error: "tenant_not_found" }, { status: 404 });

  const time = await getTenantPrisma(tenant.id).time.findUnique({
    where: { id },
    select: { nome: true, escudoUrl: true },
  });
  if (!time?.escudoUrl) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const imagem = await fetch(new URL(time.escudoUrl, req.url));
  if (!imagem.ok) return NextResponse.json({ error: "not_found" }, { status: 404 });

  const tipo = imagem.headers.get("content-type") ?? "application/octet-stream";
  const ext = time.escudoUrl.match(/\.(png|jpe?g|webp|svg|gif)(?:\?|$)/i)?.[1] ?? "png";
  const nome = `escudo-${time.nome}`.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^\w-]+/g, "-").toLowerCase();

  return new NextResponse(imagem.body, {
    headers: {
      "Content-Type": tipo,
      "Content-Disposition": `attachment; filename="${nome}.${ext}"`,
      "Cache-Control": "no-store",
    },
  });
}
