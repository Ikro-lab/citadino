"use client";

import { usePathname } from "next/navigation";
import { ChipLink, ChipRow } from "@/components/ui/chips";

/** Menu de seções dos painéis (admin/treinador), com a seção atual destacada. */
export function SectionNav({ links }: { links: { href: string; label: string; exact?: boolean }[] }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções do painel" className="mb-6">
      <ChipRow>
        {links.map((l) => {
          const ativo = l.exact ? pathname === l.href : pathname === l.href || pathname.startsWith(`${l.href}/`);
          return (
            <ChipLink key={l.href} href={l.href} ativo={ativo}>
              {l.label}
            </ChipLink>
          );
        })}
      </ChipRow>
    </nav>
  );
}
