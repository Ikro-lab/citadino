import Link from "next/link";
import { requireAdmin } from "@/lib/require-role";

const links = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/campeonatos", label: "Campeonatos" },
  { href: "/admin/categorias", label: "Categorias" },
  { href: "/admin/times", label: "Times" },
  { href: "/admin/partidas", label: "Partidas" },
  { href: "/admin/solicitacoes", label: "Solicitações" },
  { href: "/admin/inscricoes", label: "Inscrições" },
  { href: "/admin/enquetes", label: "Enquetes" },
  { href: "/admin/notificacoes", label: "Notificações" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

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
