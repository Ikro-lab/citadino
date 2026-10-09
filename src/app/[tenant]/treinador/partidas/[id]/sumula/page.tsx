import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { SumulaPlacar, EventoRegistrado } from "@/components/partidas/sumula-parts";

export default async function TreinadorSumulaPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const session = await auth();
  const userId = session!.user.id;
  const db = getTenantPrisma(session!.user.tenantId!);

  const partida = await db.partida.findUnique({
    where: { id },
    include: {
      categoria: { select: { nome: true } },
      timeCasa: { include: { atletas: { orderBy: { numero: "asc" } } } },
      timeFora: { include: { atletas: { orderBy: { numero: "asc" } } } },
      eventos: {
        orderBy: { minuto: "asc" },
        include: { atleta: true, time: { select: { nome: true } } },
      },
    },
  });

  if (!partida) notFound();

  const meuTime =
    partida.timeCasa.treinadorId === userId
      ? partida.timeCasa
      : partida.timeFora.treinadorId === userId
        ? partida.timeFora
        : null;

  if (!meuTime) redirect(paths.treinador.partidas(tenantSlug));

  // Súmula só para acompanhar: lances e vídeos são lançados pela organização.
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SumulaPlacar partida={partida} />
      </Card>

      <p className="text-center text-xs text-muted">Os lances da partida são lançados pela organização do campeonato.</p>

      <Card>
        <h2 className="mb-3 font-semibold">Lances registrados</h2>
        <div className="flex flex-col gap-2">
          {partida.eventos.map((e) => (
            <EventoRegistrado key={e.id} evento={e} />
          ))}
          {partida.eventos.length === 0 && (
            <p className="text-sm text-muted">Nenhum lance registrado ainda.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
