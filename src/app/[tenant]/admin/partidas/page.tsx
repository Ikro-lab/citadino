import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { EmptyState } from "@/components/ui/empty-state";
import { NovoItem } from "@/components/ui/novo-item";
import { DeleteButton } from "@/components/ui/delete-button";
import { PartidaForm } from "@/components/partidas/partida-form";
import { PartidaListItem, acaoLinkClass } from "@/components/partidas/partida-list-item";
import { createPartida, deletePartida } from "@/lib/actions/partidas";
import { dayRange, todayStr } from "@/lib/date-utils";

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
      orderBy: { dataHora: "asc" },
      include: {
        timeCasa: { select: { nome: true } },
        timeFora: { select: { nome: true } },
        categoria: { select: { nome: true } },
      },
    }),
    db.categoria.findMany({ orderBy: { nome: "asc" } }),
    db.time.findMany({ orderBy: { nome: "asc" }, select: { id: true, nome: true, categoriaId: true } }),
  ]);

  // Ao vivo no topo, depois hoje e as próximas (mais cedo primeiro) e, por
  // último, as anteriores (mais recente primeiro): partida encerrada continua
  // acessível para completar a súmula.
  const inicioHoje = dayRange(todayStr()).start;
  const secoes = [
    { titulo: "Ao vivo", lista: partidas.filter((p) => p.status === "AO_VIVO") },
    { titulo: "Hoje e próximas", lista: partidas.filter((p) => p.status !== "AO_VIVO" && p.dataHora >= inicioHoje) },
    { titulo: "Anteriores", lista: partidas.filter((p) => p.status !== "AO_VIVO" && p.dataHora < inicioHoje).reverse() },
  ].filter((s) => s.lista.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <NovoItem titulo="Nova partida" aberto={partidas.length === 0}>
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
      </NovoItem>

      {secoes.map((secao) => (
        <section key={secao.titulo} className="flex flex-col gap-2">
          <h2 className="font-semibold">{secao.titulo}</h2>
          {secao.lista.map((p) => (
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
        </section>
      ))}
      {partidas.length === 0 && <EmptyState>Nenhuma partida agendada ainda. Use o formulário acima.</EmptyState>}
    </div>
  );
}
