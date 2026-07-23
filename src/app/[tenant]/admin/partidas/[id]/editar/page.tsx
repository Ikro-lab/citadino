import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { PartidaForm } from "@/components/partidas/partida-form";
import { updatePartida } from "@/lib/actions/partidas";
import { formatDatetimeLocalBRT } from "@/lib/date-utils";

export default async function EditarPartidaPage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [partida, categorias, times] = await Promise.all([
    db.partida.findUnique({ where: { id } }),
    db.categoria.findMany({ orderBy: { nome: "asc" } }),
    db.time.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true, categoriaId: true } }),
  ]);

  if (!partida) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Editar partida</h2>
        <PartidaForm
          action={updatePartida.bind(null, id)}
          categorias={categorias}
          times={times}
          submitLabel="Salvar alterações"
          defaultValues={{
            categoriaId: partida.categoriaId,
            timeCasaId: partida.timeCasaId,
            timeForaId: partida.timeForaId,
            dataHora: formatDatetimeLocalBRT(partida.dataHora),
            local: partida.local ?? undefined,
            rodada: partida.rodada ?? undefined,
            fase: partida.fase,
          }}
        />
      </Card>
    </div>
  );
}
