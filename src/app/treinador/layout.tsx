import Link from "next/link";
import { requireTreinador } from "@/lib/require-role";

export default async function TreinadorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireTreinador();

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Meu Time</h1>
      <nav className="mb-6 flex gap-2">
        <Link
          href="/treinador"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-border/60"
        >
          Elenco
        </Link>
        <Link
          href="/treinador/partidas"
          className="rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium hover:bg-border/60"
        >
          Partidas
        </Link>
      </nav>
      {children}
    </div>
  );
}
