import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DeleteButton } from "@/components/ui/delete-button";
import { PartidaForm } from "@/components/partidas/partida-form";
import { PartidaListItem, acaoLinkClass } from "@/components/partidas/partida-list-item";
import { createPartida, deletePartida } from "@/lib/actions/partidas";

export default async function AdminPartidasPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [partidas, categorias, times] = await Promise.all([
    db.partida.findMany({
      orderBy: { dataHora: "desc" },
      include: {
        timeCasa: { select: { nome: true } },
        timeFora: { select: { nome: true } },
        categoria: { select: { nome: true } },
      },
      take: 50,
    }),
    db.categoria.findMany({ orderBy: { nome: "asc" } }),
    db.time.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true, categoriaId: true } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Nova partida</h2>
        {categorias.length === 0 || times.length === 0 ? (
          <p className="text-sm text-muted">
            Para agendar partidas, primeiro crie uma{" "}
            <Link href={paths.admin.categorias(tenantSlug)} className="font-semibold text-accent">
              categoria
            </Link>{" "}
            e cadastre os{" "}
            <Link href={paths.admin.times(tenantSlug)} className="font-semibold text-accent">
              times
            </Link>
            .
          </p>
        ) : (
          <PartidaForm action={createPartida} categorias={categorias} times={times} submitLabel="Agendar partida" />
        )}
      </Card>

      <section className="flex flex-col gap-2">
        {partidas.map((p) => (
          <PartidaListItem
            key={p.id}
            partida={p}
            actions={
              <>
                <Link href={paths.admin.partidaSumula(tenantSlug, p.id)} className={acaoLinkClass}>
                  Súmula
                </Link>
                <Link href={paths.admin.partidaEditar(tenantSlug, p.id)} className={acaoLinkClass}>
                  Editar
                </Link>
                <DeleteButton action={deletePartida.bind(null, p.id)} />
              </>
            }
          />
        ))}
        {partidas.length === 0 && <EmptyState>Nenhuma partida agendada ainda. Use o formulário acima.</EmptyState>}
      </section>
    </div>
  );
}
