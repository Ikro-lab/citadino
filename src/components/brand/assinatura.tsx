import Link from "next/link";
import { paths } from "@/lib/tenant-path";

// Crédito do autor no fim das páginas, como nos rodapés de outros softwares.
// Nas páginas de um campeonato, leva também o link da política de privacidade.
export function Assinatura({ tenantSlug }: { tenantSlug?: string }) {
  return (
    <p className="px-4 py-4 text-center text-xs text-muted">
      {tenantSlug && (
        <>
          <Link href={paths.privacidade(tenantSlug)} className="underline hover:text-foreground">
            Política de privacidade
          </Link>
          {" · "}
        </>
      )}
      Desenvolvido por <span className="font-semibold">Vitor Freitas</span>
    </p>
  );
}
