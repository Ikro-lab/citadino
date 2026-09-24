import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { SumulaForm } from "@/components/partidas/sumula-form";
import { SumulaPlacar, EventoRegistrado } from "@/components/partidas/sumula-parts";
import { VideoUploadButton } from "@/components/partidas/video-upload-button";
import { TransmissaoCard } from "@/components/partidas/transmissao-card";
import { ClipeYoutubeAjuste } from "@/components/partidas/clipe-youtube-ajuste";
import { getAtletasSuspensosIds } from "@/lib/artilharia";
import { extrairYoutubeId } from "@/lib/youtube";
import { iniciarPartida, encerrarPartida, adiarPartida, deleteEvento } from "@/lib/actions/partidas";

export default async function SumulaPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

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

  const suspensos = await getAtletasSuspensosIds(tenant.id, partida.categoriaId);
  const timeCasaDisponivel = {
    ...partida.timeCasa,
    atletas: partida.timeCasa.atletas.filter((a) => !suspensos.has(a.id)),
  };
  const timeForaDisponivel = {
    ...partida.timeFora,
    atletas: partida.timeFora.atletas.filter((a) => !suspensos.has(a.id)),
  };
  const suspensosNestaPartida = [...partida.timeCasa.atletas, ...partida.timeFora.atletas].filter(
    (a) => suspensos.has(a.id)
  );

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <SumulaPlacar partida={partida} />

        {(partida.status === "AGENDADA" || partida.status === "AO_VIVO") && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            {partida.status === "AGENDADA" && (
              <>
                <form action={iniciarPartida.bind(null, id)}>
                  <Button type="submit" size="lg" className="w-full">
                    Iniciar partida
                  </Button>
                </form>
                <form action={adiarPartida.bind(null, id)}>
                  <Button type="submit" variant="secondary" size="lg" className="w-full">
                    Adiar
                  </Button>
                </form>
              </>
            )}
            {partida.status === "AO_VIVO" && (
              <form action={encerrarPartida.bind(null, id)} className="col-span-2">
                <Button type="submit" variant="secondary" size="lg" className="w-full">
                  Encerrar partida
                </Button>
              </form>
            )}
          </div>
        )}
      </Card>

      {/* Antes e durante o jogo, a live fica no topo: precisa estar configurada antes do 1º gol. */}
      {partida.status !== "ENCERRADA" && <TransmissaoCard partida={partida} />}

      {(partida.status === "AO_VIVO" || partida.status === "AGENDADA") && (
        <Card>
          <h2 className="mb-3 font-semibold">Registrar lance</h2>
          {suspensosNestaPartida.length > 0 && (
            <p className="mb-3 rounded-lg bg-danger/10 px-3 py-2 text-xs text-danger">
              Suspensos por cartão, fora da lista: {suspensosNestaPartida.map((a) => a.nome).join(", ")}
            </p>
          )}
          <SumulaForm partidaId={id} timeCasa={timeCasaDisponivel} timeFora={timeForaDisponivel} />
        </Card>
      )}

      <Card>
        <h2 className="mb-3 font-semibold">Lances registrados</h2>
        <div className="flex flex-col gap-2">
          {partida.eventos.map((e) => (
            <EventoRegistrado key={e.id} evento={e}>
              {e.videoUrl && extrairYoutubeId(e.videoUrl) ? (
                <ClipeYoutubeAjuste eventoId={e.id} videoUrl={e.videoUrl} />
              ) : (
                <VideoUploadButton eventoId={e.id} videoUrl={e.videoUrl} />
              )}
              <DeleteButton action={deleteEvento.bind(null, e.id, id)} />
            </EventoRegistrado>
          ))}
          {partida.eventos.length === 0 && (
            <p className="text-sm text-muted">Nenhum lance registrado ainda.</p>
          )}
        </div>
      </Card>

      {partida.status === "ENCERRADA" && <TransmissaoCard partida={partida} />}
    </div>
  );
}
