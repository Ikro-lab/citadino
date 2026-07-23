import Link from "next/link";
import { requireAdmin } from "@/lib/require-role";
import { paths } from "@/lib/tenant-path";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  await requireAdmin(tenantSlug);

  const links = [
    { href: paths.admin.root(tenantSlug), label: "Dashboard" },
    { href: paths.admin.campeonatos(tenantSlug), label: "Campeonatos" },
    { href: paths.admin.categorias(tenantSlug), label: "Categorias" },
    { href: paths.admin.times(tenantSlug), label: "Times" },
    { href: paths.admin.partidas(tenantSlug), label: "Partidas" },
    { href: paths.admin.solicitacoes(tenantSlug), label: "Solicitações" },
    { href: paths.admin.inscricoes(tenantSlug), label: "Inscrições" },
    { href: paths.admin.enquetes(tenantSlug), label: "Enquetes" },
    { href: paths.admin.patrocinadores(tenantSlug), label: "Patrocinadores" },
    { href: paths.admin.notificacoes(tenantSlug), label: "Notificações" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Painel Administrativo</h1>
      <nav className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none]">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="shrink-0 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium whitespace-nowrap hover:bg-border/60"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
