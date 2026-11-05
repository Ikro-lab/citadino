import { requireAdmin } from "@/lib/require-role";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { PageHeader } from "@/components/ui/page-header";
import { SectionNav } from "@/components/nav/section-nav";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const session = await requireAdmin(tenantSlug);
  const pendentes = await getTenantPrisma(session.user.tenantId!).golSugerido.count({ where: { status: "PENDENTE" } });

  const links = [
    { href: paths.admin.root(tenantSlug), label: "Resumo", exact: true },
    { href: paths.admin.partidas(tenantSlug), label: "Partidas" },
    { href: paths.admin.golsSugeridos(tenantSlug), label: pendentes ? `Gols detectados (${pendentes})` : "Gols detectados" },
    { href: paths.admin.times(tenantSlug), label: "Times" },
    { href: paths.admin.inscricoes(tenantSlug), label: "Inscrições" },
    { href: paths.admin.solicitacoes(tenantSlug), label: "Solicitações" },
    { href: paths.admin.enquetes(tenantSlug), label: "Enquetes" },
    { href: paths.admin.patrocinadores(tenantSlug), label: "Patrocinadores" },
    { href: paths.admin.notificacoes(tenantSlug), label: "Avisos" },
    { href: paths.admin.categorias(tenantSlug), label: "Categorias" },
    { href: paths.admin.campeonatos(tenantSlug), label: "Campeonatos" },
    { href: paths.admin.privacidade(tenantSlug), label: "Privacidade" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <PageHeader title="Painel" />
      <SectionNav links={links} />
      {children}
    </div>
  );
}
