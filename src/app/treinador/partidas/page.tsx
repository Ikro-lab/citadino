import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TIMEZONE } from "@/lib/date-utils";

const statusConfig = {
  AGENDADA: { label: "Agendada", variant: "neutral" as const },
  AO_VIVO: { label: "Ao vivo", variant: "live" as const },
  ENCERRADA: { label: "Encerrada", variant: "success" as const },
  ADIADA: { label: "Adiada", variant: "danger" as const },
};

export default async function TreinadorPartidasPage() {
  const session = await auth();
  const userId = session!.user.id;

  const times = await prisma.time.findMany({
    where: { treinadorId: userId },
    select: { id: true },
  });
  const timeIds = times.map((t) => t.id);

  const partidas = timeIds.length
    ? await prisma.partida.findMany({
        where: { OR: [{ timeCasaId: { in: timeIds } }, { timeForaId: { in: timeIds } }] },
        orderBy: { dataHora: "desc" },
        include: {
          timeCasa: { select: { nome: true } },
          timeFora: { select: { nome: true } },
          categoria: { select: { nome: true } },
        },
      })
    : [];

  return (
    <div className="flex flex-col gap-2">
      {partidas.map((p) => {
        const status = statusConfig[p.status];
        return (
          <Link key={p.id} href={`/treinador/partidas/${p.id}/sumula`}>
            <Card className="flex items-center justify-between hover:shadow-md">
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
              <Badge variant={status.variant} pulse={p.status === "AO_VIVO"}>
                {status.label}
              </Badge>
            </Card>
          </Link>
        );
      })}
      {partidas.length === 0 && (
        <p className="text-sm text-muted">Nenhuma partida encontrada para o seu time.</p>
      )}
    </div>
  );
}
