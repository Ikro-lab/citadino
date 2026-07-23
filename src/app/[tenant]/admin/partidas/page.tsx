import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import { PartidaForm } from "@/components/partidas/partida-form";
import { createPartida, deletePartida } from "@/lib/actions/partidas";
import { TIMEZONE } from "@/lib/date-utils";

const statusLabel: Record<string, { label: string; variant: "neutral" | "live" | "success" | "danger" }> = {
  AGENDADA: { label: "Agendada", variant: "neutral" },
  AO_VIVO: { label: "Ao vivo", variant: "live" },
  ENCERRADA: { label: "Encerrada", variant: "success" },
  ADIADA: { label: "Adiada", variant: "danger" },
};

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
          <p className="text-sm text-muted">Cadastre categorias e times antes de agendar partidas.</p>
        ) : (
          <PartidaForm action={createPartida} categorias={categorias} times={times} submitLabel="Agendar partida" />
        )}
      </Card>

      <div className="flex flex-col gap-2">
        {partidas.map((p) => {
          const status = statusLabel[p.status];
          return (
            <Card key={p.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {p.timeCasa.nome} {p.placarCasa} x {p.placarFora} {p.timeFora.nome}
                </p>
                <p className="text-xs text-muted">
                  {p.categoria.nome} ·{" "}
                  {new Date(p.dataHora).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: TIMEZONE,
                  })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={status.variant} pulse={p.status === "AO_VIVO"}>
                  {status.label}
                </Badge>
                <Link
                  href={paths.admin.partidaEditar(tenantSlug, p.id)}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft"
                >
                  Editar
                </Link>
                <Link
                  href={paths.admin.partidaSumula(tenantSlug, p.id)}
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft"
                >
                  Súmula
                </Link>
                <DeleteButton action={deletePartida.bind(null, p.id)} />
              </div>
            </Card>
          );
        })}
        {partidas.length === 0 && <p className="text-sm text-muted">Nenhuma partida cadastrada.</p>}
      </div>
    </div>
  );
}
