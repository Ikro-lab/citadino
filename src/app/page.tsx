import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Flamula } from "@/components/brand/flamula";

export default async function LandingPage() {
  const tenants = await prisma.tenant.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { slug: true, nome: true },
  });

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-lg flex-col px-4 py-10">
      <div className="mb-8 flex items-center gap-3">
        <Flamula nome="Citadino" size={40} />
        <div>
          <h1 className="font-display text-4xl font-bold leading-none tracking-tight">Citadino</h1>
          <p className="text-sm text-muted">Campeonatos de futsal, jogo a jogo.</p>
        </div>
      </div>

      {tenants.length > 0 ? (
        <div className="flex w-full flex-col">
          <h2 className="mb-2 text-sm font-semibold text-muted">Escolha o seu campeonato</h2>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl bg-surface dark:border dark:border-border">
            {tenants.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/${t.slug}`}
                  className="flex min-h-14 items-center justify-between gap-3 px-4 hover:bg-field"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Flamula nome={t.nome} size={20} />
                    <span className="truncate font-semibold">{t.nome}</span>
                  </span>
                  <ChevronRight size={18} className="shrink-0 text-muted" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-muted">
          Nenhum campeonato disponível no momento. Abra o link que o organizador do seu campeonato
          enviou (ex: <code>citadino.com/seu-campeonato</code>).
        </p>
      )}
    </div>
  );
}
