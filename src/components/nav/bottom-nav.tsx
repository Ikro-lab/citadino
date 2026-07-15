"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Target, LogIn, LayoutDashboard, Shield, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { logout } from "@/lib/actions/auth";
import type { Role } from "@prisma/client";

export function BottomNav({ role }: { role: Role | null }) {
  const pathname = usePathname();

  const items = [
    { href: "/", label: "Feed", icon: Home },
    { href: "/classificacao", label: "Tabela", icon: Trophy },
    { href: "/artilharia", label: "Artilheiros", icon: Target },
    role === "ADMIN"
      ? { href: "/admin", label: "Painel", icon: LayoutDashboard }
      : role === "TREINADOR"
        ? { href: "/treinador", label: "Meu Time", icon: Shield }
        : { href: "/login", label: "Entrar", icon: LogIn },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium",
              isActive(href) ? "text-accent" : "text-muted"
            )}
          >
            <Icon size={22} strokeWidth={isActive(href) ? 2.5 : 2} />
            {label}
          </Link>
        ))}
        {role && (
          <form action={logout} className="flex flex-1">
            <button
              type="submit"
              className="flex min-h-[56px] flex-1 flex-col items-center justify-center gap-0.5 text-xs font-medium text-muted"
            >
              <LogOut size={22} />
              Sair
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
