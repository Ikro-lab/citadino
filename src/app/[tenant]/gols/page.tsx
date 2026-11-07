import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/tenant";
import { getDeviceIdReadOnly } from "@/lib/device-id";
import { buscarFeedGols } from "@/lib/feed-gols";
import { FeedGols } from "@/components/gols/feed-gols";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ ordem?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  return { title: `Gols | ${tenant.nome}`, description: `Os gols do ${tenant.nome} em vídeo.` };
}

export default async function GolsPage({ params, searchParams }: Props) {
  const { tenant: tenantSlug } = await params;
  const { ordem: ordemParam } = await searchParams;
  const ordem = ordemParam === "curtidos" ? "curtidos" : "recentes";
  const tenant = await getTenantBySlug(tenantSlug);
  const { gols, temMais } = await buscarFeedGols(tenant.id, ordem, 0, await getDeviceIdReadOnly());

  // key: trocar a ordem recomeça a rolagem do topo.
  return <FeedGols key={ordem} tenantSlug={tenantSlug} ordem={ordem} golsIniciais={gols} temMaisInicial={temMais} />;
}
