"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Target, Vote, LogIn, LayoutDashboard, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { paths } from "@/lib/tenant-path";
import type { Role } from "@prisma/client";

export function BottomNav({ role, tenantSlug }: { role: Role | null; tenantSlug: string }) {
  const pathname = usePathname();
  const home = paths.home(tenantSlug);

  const items = [
    { href: home, label: "Feed", icon: Home },
    { href: paths.classificacao(tenantSlug), label: "Tabela", icon: Trophy },
    { href: paths.artilharia(tenantSlug), label: "Artilharia", icon: Target },
    { href: paths.enquete(tenantSlug), label: "Enquete", icon: Vote },
    role === "ADMIN"
      ? { href: paths.admin.root(tenantSlug), label: "Painel", icon: LayoutDashboard }
      : role === "TREINADOR"
        ? { href: paths.treinador.root(tenantSlug), label: "Meu time", icon: Shield }
        : { href: paths.login(tenantSlug), label: "Entrar", icon: LogIn },
  ];

  const isActive = (href: string) =>
    href === home ? pathname === home : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch">
        {items.map(({ href, label, icon: Icon }) => {
          const ativo = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={ativo ? "page" : undefined}
              className={cn(
                "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
                ativo ? "text-accent" : "text-muted"
              )}
            >
              <Icon size={22} strokeWidth={ativo ? 2.5 : 2} />
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
