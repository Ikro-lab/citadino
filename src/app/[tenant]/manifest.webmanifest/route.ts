import { NextResponse } from "next/server";
import type { MetadataRoute } from "next";
import { getTenantBySlugOrNull } from "@/lib/tenant";

/**
 * Manifest de cada campeonato. O app/manifest.ts da raiz abre em "/" (a lista
 * de campeonatos); com este, quem instala a partir de /<campeonato> ganha um
 * app que já abre no próprio campeonato, com o nome e a cor dele. O `id` por
 * campeonato deixa instalar mais de um no mesmo celular como apps separados.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant: slug } = await params;
  const tenant = await getTenantBySlugOrNull(slug);
  if (!tenant) return NextResponse.json({ error: "tenant_not_found" }, { status: 404 });

  const manifest: MetadataRoute.Manifest = {
    id: `/${tenant.slug}`,
    name: tenant.nome,
    short_name: tenant.nome,
    description: `Feed de partidas ao vivo, resultados, classificação e artilharia do ${tenant.nome}.`,
    start_url: `/${tenant.slug}`,
    scope: `/${tenant.slug}`,
    display: "standalone",
    background_color: "#ffffff",
    theme_color: tenant.corPrimaria,
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };

  return NextResponse.json(manifest, {
    headers: {
      "Content-Type": "application/manifest+json",
      // Nome/cor mudam raramente; a CDN segura por 1h.
      "CDN-Cache-Control": "max-age=3600, stale-while-revalidate=86400",
    },
  });
}
