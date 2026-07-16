import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIMEZONE } from "@/lib/date-utils";

export default async function AdminDashboard() {
  const [proximas, aoVivo, solicitacoesPendentes, totalTimes, totalAtletas] =
    await Promise.all([
      prisma.partida.findMany({
        where: { status: "AGENDADA", dataHora: { gte: new Date() } },
        orderBy: { dataHora: "asc" },
        take: 5,
        include: {
          timeCasa: { select: { nome: true } },
          timeFora: { select: { nome: true } },
          categoria: { select: { nome: true } },
        },
      }),
      prisma.partida.findMany({
        where: { status: "AO_VIVO" },
        include: {
          timeCasa: { select: { nome: true } },
          timeFora: { select: { nome: true } },
        },
      }),
      prisma.solicitacaoTime.count({ where: { status: "PENDENTE" } }),
      prisma.time.count(),
      prisma.atleta.count(),
    ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Ao vivo</p>
          <p className="text-2xl font-bold text-accent">{aoVivo.length}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Solicitações</p>
          <p className="text-2xl font-bold">{solicitacoesPendentes}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Times</p>
          <p className="text-2xl font-bold">{totalTimes}</p>
        </Card>
        <Card>
          <p className="text-xs font-medium uppercase text-muted">Atletas</p>
          <p className="text-2xl font-bold">{totalAtletas}</p>
        </Card>
      </div>

      {aoVivo.length > 0 && (
        <div>
          <h2 className="mb-2 font-semibold">Partidas ao vivo agora</h2>
          <div className="flex flex-col gap-2">
            {aoVivo.map((p) => (
              <Link key={p.id} href={`/admin/partidas/${p.id}/sumula`}>
                <Card className="flex items-center justify-between">
                  <span className="font-medium">
                    {p.timeCasa.nome} {p.placarCasa} x {p.placarFora} {p.timeFora.nome}
                  </span>
                  <Badge variant="live" pulse>
                    Ao vivo
                  </Badge>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="mb-2 font-semibold">Próximas partidas</h2>
        {proximas.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma partida agendada.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {proximas.map((p) => (
              <Card key={p.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">
                    {p.timeCasa.nome} x {p.timeFora.nome}
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
                <Link
                  href={`/admin/partidas/${p.id}/sumula`}
                  className="text-sm font-semibold text-accent"
                >
                  Súmula
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
