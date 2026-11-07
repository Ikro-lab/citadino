import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getTenantBySlug } from "@/lib/tenant";
import { getDeviceIdReadOnly } from "@/lib/device-id";
import { buscarFeedGols, categoriasDoFeed, COOKIE_CATEGORIA_GOLS, type OrdemFeed } from "@/lib/feed-gols";
import { FeedGols } from "@/components/gols/feed-gols";

type Props = {
  params: Promise<{ tenant: string }>;
  searchParams: Promise<{ ordem?: string; categoria?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  return { title: `Gols | ${tenant.nome}`, description: `Os gols do ${tenant.nome} em vídeo.` };
}

export default async function GolsPage({ params, searchParams }: Props) {
  const { tenant: tenantSlug } = await params;
  const sp = await searchParams;
  const ordem: OrdemFeed = sp.ordem === "curtidos" || sp.ordem === "dia" ? sp.ordem : "recentes";
  const tenant = await getTenantBySlug(tenantSlug);
  const categorias = await categoriasDoFeed(tenant.id);

  // Recentes: a categoria vem do link ou da escolha guardada no aparelho.
  // Sem nenhuma das duas (primeiro acesso), o feed abre perguntando.
  const escolhida = sp.categoria ?? (await cookies()).get(COOKIE_CATEGORIA_GOLS)?.value;
  const valida = escolhida === "todas" || categorias.some((c) => c.id === escolhida);
  const categoria = valida ? escolhida! : null;
  const perguntarCategoria = ordem === "recentes" && !categoria;

  const { gols, temMais, diaRotulo } = perguntarCategoria
    ? { gols: [], temMais: false, diaRotulo: undefined }
    : await buscarFeedGols(
        tenant.id,
        { ordem, categoriaId: categoria === "todas" ? null : categoria },
        0,
        await getDeviceIdReadOnly()
      );

  return (
    <FeedGols
      // Trocar de aba ou de categoria recomeça a rolagem do topo.
      key={`${ordem}-${categoria}`}
      tenantSlug={tenantSlug}
      ordem={ordem}
      categoria={categoria}
      categorias={categorias}
      perguntarCategoria={perguntarCategoria}
      diaRotulo={diaRotulo}
      golsIniciais={gols}
      temMaisInicial={temMais}
    />
  );
}
