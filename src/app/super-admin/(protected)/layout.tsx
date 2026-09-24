import { requireSuperAdmin } from "@/lib/require-role";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { SectionNav } from "@/components/nav/section-nav";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <PageHeader
        title="Plataforma"
        action={
          <form action={logout}>
            <Button type="submit" variant="secondary" size="sm">
              Sair
            </Button>
          </form>
        }
      />
      <SectionNav
        links={[
          { href: "/super-admin", label: "Campeonatos", exact: true },
          { href: "/super-admin/tenants/new", label: "Novo campeonato" },
        ]}
      />
      {children}
    </div>
  );
}
