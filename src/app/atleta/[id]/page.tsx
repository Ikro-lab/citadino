import { notFound } from "next/navigation";
import { AtSign } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calcularIdade } from "@/lib/utils";

export default async function AtletaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const atleta = await prisma.atleta.findUnique({
    where: { id },
    select: {
      id: true,
      nome: true,
      numero: true,
      posicao: true,
      fotoUrl: true,
      instagram: true,
      dataNascimento: true,
      time: { select: { id: true, nome: true, categoria: { select: { nome: true } } } },
    },
  });

  if (!atleta) notFound();

  const [gols, amarelos, vermelhos, jogosDoTime] = await Promise.all([
    prisma.eventoPartida.count({ where: { atletaId: id, tipo: "GOL" } }),
    prisma.eventoPartida.count({ where: { atletaId: id, tipo: "CARTAO_AMARELO" } }),
    prisma.eventoPartida.count({ where: { atletaId: id, tipo: "CARTAO_VERMELHO" } }),
    prisma.partida.count({
      where: {
        status: "ENCERRADA",
        OR: [{ timeCasaId: atleta.time.id }, { timeForaId: atleta.time.id }],
      },
    }),
  ]);

  const instagramHandle = atleta.instagram?.replace(/^@/, "").trim();

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card className="text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-surface text-2xl font-bold text-muted">
          {atleta.numero}
        </div>
        <h1 className="text-xl font-bold">{atleta.nome}</h1>
        <p className="text-sm text-muted">
          {atleta.posicao} · {atleta.time.nome}
        </p>
        <div className="mt-2 flex items-center justify-center gap-2">
          <Badge variant="accent">{atleta.time.categoria.nome}</Badge>
          {atleta.dataNascimento && (
            <Badge variant="neutral">{calcularIdade(atleta.dataNascimento)} anos</Badge>
          )}
        </div>

        {instagramHandle && (
          <a
            href={`https://instagram.com/${instagramHandle}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-surface"
          >
            <AtSign size={16} />
            {instagramHandle}
          </a>
        )}
      </Card>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <Card className="text-center">
          <p className="text-2xl font-bold text-accent">{gols}</p>
          <p className="text-xs text-muted">Gols</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-yellow-500">{amarelos}</p>
          <p className="text-xs text-muted">Amarelos</p>
        </Card>
        <Card className="text-center">
          <p className="text-2xl font-bold text-danger">{vermelhos}</p>
          <p className="text-xs text-muted">Vermelhos</p>
        </Card>
      </div>

      <Card className="mt-4">
        <p className="text-sm text-muted">
          {atleta.time.nome} disputou {jogosDoTime} partida(s) encerrada(s) nesta temporada.
        </p>
      </Card>
    </div>
  );
}
