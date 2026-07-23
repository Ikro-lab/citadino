import Link from "next/link";
import { Trophy, ChevronRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";

export default async function LandingPage() {
  const tenants = await prisma.tenant.findMany({
    where: { ativo: true },
    orderBy: { nome: "asc" },
    select: { slug: true, nome: true },
  });

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center px-4 py-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Trophy size={28} />
      </span>
      <h1 className="mb-2 text-2xl font-bold">Citadino</h1>
      <p className="mb-6 text-sm text-muted">
        Plataforma de gestão de campeonatos de futsal.
      </p>

      {tenants.length > 0 ? (
        <div className="flex w-full flex-col gap-2 text-left">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Escolha o seu campeonato
          </p>
          {tenants.map((t) => (
            <Link key={t.slug} href={`/${t.slug}`}>
              <Card className="flex items-center justify-between hover:bg-surface/60">
                <span className="font-medium">{t.nome}</span>
                <ChevronRight size={18} className="shrink-0 text-muted" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted">
          Nenhum campeonato disponível no momento. Acesse o site do seu campeonato pelo
          link fornecido pelo organizador (ex: <code>citadino.com/seu-campeonato</code>).
        </p>
      )}
    </div>
  );
}
