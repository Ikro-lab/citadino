"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/**
 * Link de navegação que sabe se está ativo. `exact` para rotas-raiz (ex: o
 * feed ou o dashboard do painel), que senão ficariam ativas em toda subpágina.
 */
export function NavLink({
  href,
  exact = false,
  className,
  activeClassName,
  children,
}: {
  href: string;
  exact?: boolean;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const ativo = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={ativo ? "page" : undefined}
      className={cn(className, ativo && activeClassName)}
    >
      {children}
    </Link>
  );
}
