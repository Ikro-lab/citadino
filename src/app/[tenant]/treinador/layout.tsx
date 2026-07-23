import Link from "next/link";
import { requireTreinador } from "@/lib/require-role";
import { paths } from "@/lib/tenant-path";

export default async function TreinadorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  await requireTreinador(tenantSlug);

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Meu Time</h1>
      <nav className="mb-6 flex gap-2">
        <Link
          href={paths.treinador.root(tenantSlug)}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-border/60"
        >
          Elenco
        </Link>
        <Link
          href={paths.treinador.partidas(tenantSlug)}
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-border/60"
        >
          Partidas
        </Link>
      </nav>
      {children}
    </div>
  );
}
