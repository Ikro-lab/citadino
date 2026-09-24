import { requireTreinador } from "@/lib/require-role";
import { paths } from "@/lib/tenant-path";
import { PageHeader } from "@/components/ui/page-header";
import { SectionNav } from "@/components/nav/section-nav";

export default async function TreinadorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  await requireTreinador(tenantSlug);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <PageHeader title="Meu time" />
      <SectionNav
        links={[
          { href: paths.treinador.root(tenantSlug), label: "Elenco", exact: true },
          { href: paths.treinador.partidas(tenantSlug), label: "Partidas" },
        ]}
      />
      {children}
    </div>
  );
}
