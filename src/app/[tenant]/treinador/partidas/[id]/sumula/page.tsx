import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { SumulaFormTreinador } from "@/components/partidas/sumula-form-treinador";
import { SumulaPlacar, EventoRegistrado } from "@/components/partidas/sumula-parts";
import { VideoUploadButton } from "@/components/partidas/video-upload-button";
import { getAtletasSuspensosIds } from "@/lib/artilharia";

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

  const suspensos = await getAtletasSuspensosIds(session!.user.tenantId!, partida.categoriaId);
  const atletasDisponiveis = meuTime.atletas.filter((a) => !suspensos.has(a.id));
  const suspensosDoTime = meuTime.atletas.filter((a) => suspensos.has(a.id));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SumulaPlacar partida={partida} />
      </Card>

      {partida.status === "AO_VIVO" ? (
        <Card>
          <h2 className="mb-3 font-semibold">Registrar lance do {meuTime.nome}</h2>
          {suspensosDoTime.length > 0 && (
            <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
              Suspensos por cartão, fora da lista: {suspensosDoTime.map((a) => a.nome).join(", ")}
            </p>
          )}
          <SumulaFormTreinador partidaId={id} timeId={meuTime.id} atletas={atletasDisponiveis} />
        </Card>
      ) : (
        <EmptyState>Os lances só podem ser lançados enquanto a partida estiver ao vivo.</EmptyState>
      )}

      <Card>
        <h2 className="mb-3 font-semibold">Lances registrados</h2>
        <div className="flex flex-col gap-2">
          {partida.eventos.map((e) => (
            <EventoRegistrado key={e.id} evento={e}>
              {e.timeId === meuTime.id && <VideoUploadButton eventoId={e.id} videoUrl={e.videoUrl} />}
            </EventoRegistrado>
          ))}
          {partida.eventos.length === 0 && (
            <p className="text-sm text-muted">Nenhum lance registrado ainda.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
