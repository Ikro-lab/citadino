import Link from "next/link";
import { Trophy, Bell } from "lucide-react";
import type { Role } from "@prisma/client";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { paths } from "@/lib/tenant-path";

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
  const primaryLabel = role === "ADMIN" ? "Painel Admin" : role === "TREINADOR" ? "Meu Time" : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={paths.home(tenantSlug)} className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Trophy size={16} />
          </span>
          {nomeSistema}
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href={paths.home(tenantSlug)} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
            Feed
          </Link>
          <Link href={paths.classificacao(tenantSlug)} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
            Classificação
          </Link>
          <Link href={paths.artilharia(tenantSlug)} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
            Artilharia
          </Link>
          <Link href={paths.enquete(tenantSlug)} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
            Enquete
          </Link>
          {primaryHref && (
            <Link href={primaryHref} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
              {primaryLabel}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <ThemeToggle />

          <Link
            href={paths.notificacoes(tenantSlug)}
            aria-label="Notificações"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface"
          >
            <Bell size={18} />
          </Link>

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
