import Link from "next/link";
import { Trophy, Bell } from "lucide-react";
import type { Role } from "@prisma/client";
import { logout } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";

export function TopHeader({
  role,
  userName,
}: {
  role: Role | null;
  userName?: string | null;
}) {
  const primaryHref = role === "ADMIN" ? "/admin" : role === "TREINADOR" ? "/treinador" : null;
  const primaryLabel = role === "ADMIN" ? "Painel Admin" : role === "TREINADOR" ? "Meu Time" : null;

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent text-white">
            <Trophy size={16} />
          </span>
          Citadino
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Link href="/" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
            Feed
          </Link>
          <Link href="/classificacao" className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
            Classificação
          </Link>
          {primaryHref && (
            <Link href={primaryHref} className="rounded-lg px-3 py-2 text-sm font-medium text-foreground hover:bg-surface">
              {primaryLabel}
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/notificacoes"
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
                <Link href="/login">
                  <Button variant="secondary" size="sm">
                    Entrar
                  </Button>
                </Link>
                <Link href="/cadastro">
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
