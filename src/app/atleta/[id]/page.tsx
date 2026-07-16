import Link from "next/link";
import { notFound } from "next/navigation";
import { AtSign, Goal, Square } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AtletaAvatar } from "@/components/atletas/atleta-avatar";
import { calcularIdade } from "@/lib/utils";
import { TIMEZONE } from "@/lib/date-utils";

const tipoConfig: Record<string, { label: string; icon: typeof Goal; className: string }> = {
  GOL: { label: "Gol", icon: Goal, className: "text-accent" },
  CARTAO_AMARELO: { label: "Cartão amarelo", icon: Square, className: "text-yellow-500" },
  CARTAO_VERMELHO: { label: "Cartão vermelho", icon: Square, className: "text-danger" },
  SUBSTITUICAO: { label: "Substituição", icon: Square, className: "text-muted" },
  OUTRO: { label: "Lance", icon: Square, className: "text-muted" },
};

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

  const [gols, amarelos, vermelhos, jogosDoTime, eventos] = await Promise.all([
    prisma.eventoPartida.count({ where: { atletaId: id, tipo: "GOL" } }),
    prisma.eventoPartida.count({ where: { atletaId: id, tipo: "CARTAO_AMARELO" } }),
    prisma.eventoPartida.count({ where: { atletaId: id, tipo: "CARTAO_VERMELHO" } }),
    prisma.partida.count({
      where: {
        status: "ENCERRADA",
        OR: [{ timeCasaId: atleta.time.id }, { timeForaId: atleta.time.id }],
      },
    }),
    prisma.eventoPartida.findMany({
      where: { atletaId: id },
      orderBy: { partida: { dataHora: "desc" } },
      select: {
        id: true,
        tipo: true,
        minuto: true,
        videoUrl: true,
        descricao: true,
        timeId: true,
        partida: {
          select: {
            id: true,
            dataHora: true,
            timeCasaId: true,
            timeForaId: true,
            timeCasa: { select: { nome: true } },
            timeFora: { select: { nome: true } },
          },
        },
      },
    }),
  ]);

  const instagramHandle = atleta.instagram?.replace(/^@/, "").trim();

  return (
    <div className="mx-auto max-w-sm px-4 py-6">
      <Card className="text-center">
        <div className="mx-auto mb-3">
          <AtletaAvatar nome={atleta.nome} fotoUrl={atleta.fotoUrl} size={80} className="text-2xl" />
        </div>
        <h1 className="text-xl font-bold">{atleta.nome}</h1>
        <p className="text-sm text-muted">
          #{atleta.numero} · {atleta.posicao} · {atleta.time.nome}
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

      <Card className="mt-4">
        <h2 className="mb-3 font-semibold">Gols e lances</h2>
        {eventos.length === 0 ? (
          <p className="text-sm text-muted">Nenhum gol ou lance registrado ainda.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {eventos.map((e) => {
              const config = tipoConfig[e.tipo] ?? tipoConfig.OUTRO;
              const Icon = config.icon;
              const adversario =
                e.timeId === e.partida.timeCasaId
                  ? e.partida.timeFora.nome
                  : e.partida.timeCasa.nome;
              const data = new Date(e.partida.dataHora).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                timeZone: TIMEZONE,
              });

              return (
                <li key={e.id} className="flex flex-col gap-2 text-sm">
                  <Link
                    href={`/partida/${e.partida.id}`}
                    className="flex items-start gap-3 hover:text-accent"
                  >
                    <Icon size={16} className={`mt-0.5 shrink-0 ${config.className}`} />
                    <div>
                      <p className="font-medium">
                        {config.label} · {e.minuto}&apos;
                      </p>
                      <p className="text-xs text-muted">
                        vs {adversario} · {data}
                        {e.descricao ? ` · ${e.descricao}` : ""}
                      </p>
                    </div>
                  </Link>
                  {e.videoUrl && (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <video
                      controls
                      preload="metadata"
                      src={e.videoUrl}
                      className="max-h-64 w-full rounded-lg"
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </Card>
    </div>
  );
}
