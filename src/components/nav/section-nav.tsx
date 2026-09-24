"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ChipLink, ChipRow } from "@/components/ui/chips";
import { centralizarChip } from "@/lib/centralizar-chip";

/** Menu de seções dos painéis (admin/treinador), com a seção atual destacada. */
export function SectionNav({ links }: { links: { href: string; label: string; exact?: boolean }[] }) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);

  // No celular o menu rola de lado: traz a seção atual para a vista.
  useEffect(() => {
    centralizarChip(navRef.current?.querySelector<HTMLElement>('[aria-current="page"]'));
  }, [pathname]);

  return (
    <nav ref={navRef} aria-label="Seções do painel" className="mb-6">
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
