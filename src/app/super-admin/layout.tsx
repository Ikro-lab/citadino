import Link from "next/link";
import { requireSuperAdmin } from "@/lib/require-role";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export default async function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireSuperAdmin();

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Painel da Plataforma</h1>
        <form action={logout}>
          <Button type="submit" variant="secondary" size="sm">
            Sair
          </Button>
        </form>
      </div>
      <nav className="mb-6 flex gap-2">
        <Link
          href="/super-admin"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-border/60"
        >
          Tenants
        </Link>
        <Link
          href="/super-admin/tenants/new"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-border/60"
        >
          Novo tenant
        </Link>
      </nav>
      {children}
    </div>
  );
}
