import Link from "next/link";
import { Bell, LogOut } from "lucide-react";
import type { Role } from "@prisma/client";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Flamula } from "@/components/brand/flamula";
import { NavLink } from "@/components/nav/nav-link";
import { paths } from "@/lib/tenant-path";

const navLinkClass = "rounded-lg px-3 py-2 text-sm font-medium text-muted hover:bg-surface hover:text-foreground";
const navLinkActive = "text-foreground bg-surface";
const iconButtonClass = "flex h-10 w-10 items-center justify-center rounded-lg text-muted hover:bg-surface";

export function TopHeader({
  role,
  userName,
  tenantSlug,
  nomeSistema,
}: {
  role: Role | null;
  userName?: string | null;
  tenantSlug: string;
  nomeSistema: string;
}) {
  const primaryHref =
    role === "ADMIN"
      ? paths.admin.root(tenantSlug)
      : role === "TREINADOR"
        ? paths.treinador.root(tenantSlug)
        : null;
  const primaryLabel = role === "ADMIN" ? "Painel" : role === "TREINADOR" ? "Meu time" : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 pt-[env(safe-area-inset-top)] backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link href={paths.home(tenantSlug)} className="flex min-w-0 items-center gap-2">
          <Flamula nome={nomeSistema} size={24} />
          <span className="truncate font-display text-xl font-bold leading-none tracking-tight">
            {nomeSistema}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href={paths.home(tenantSlug)} exact className={navLinkClass} activeClassName={navLinkActive}>
            Feed
          </NavLink>
          <NavLink href={paths.classificacao(tenantSlug)} className={navLinkClass} activeClassName={navLinkActive}>
            Classificação
          </NavLink>
          <NavLink href={paths.artilharia(tenantSlug)} className={navLinkClass} activeClassName={navLinkActive}>
            Artilharia
          </NavLink>
          <NavLink href={paths.enquete(tenantSlug)} className={navLinkClass} activeClassName={navLinkActive}>
            Enquete
          </NavLink>
          {primaryHref && (
            <NavLink href={primaryHref} className={navLinkClass} activeClassName={navLinkActive}>
              {primaryLabel}
            </NavLink>
          )}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          <ThemeToggle />

          <Link href={paths.notificacoes(tenantSlug)} aria-label="Notificações" className={iconButtonClass}>
            <Bell size={18} />
          </Link>

          {role && (
            <form action={logout} className="md:hidden">
              <button type="submit" aria-label="Sair" className={iconButtonClass}>
                <LogOut size={18} />
              </button>
            </form>
          )}

          <div className="hidden items-center gap-3 md:flex">
            {role ? (
              <>
                {userName && <span className="text-sm text-muted">{userName}</span>}
                <form action={logout}>
                  <Button type="submit" variant="secondary" size="sm">
                    Sair
                  </Button>
                </form>
              </>
            ) : (
              <>
                <Link href={paths.login(tenantSlug)}>
                  <Button variant="secondary" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href={paths.cadastro(tenantSlug)}>
                  <Button variant="primary" size="sm">
                    Sou treinador
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
