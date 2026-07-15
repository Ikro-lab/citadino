import { resolveCategoriaId } from "@/lib/categorias";
import { prisma } from "@/lib/prisma";
import { getDeviceIdReadOnly } from "@/lib/device-id";
import { CategoriaTabs } from "@/components/partidas/categoria-tabs";
import { EnqueteCard } from "@/components/enquetes/enquete-card";

export default async function EnquetePage({
  searchParams,
}: {
  searchParams: Promise<{ categoria?: string }>;
}) {
  const sp = await searchParams;
  const { categoriaId, categorias } = await resolveCategoriaId(sp.categoria);

  const enquetes = categoriaId
    ? await prisma.enquete.findMany({
        where: { categoriaId, ativa: true },
        orderBy: { rodada: "desc" },
        include: {
          opcoes: {
            include: {
              atleta: { select: { nome: true, time: { select: { nome: true } } } },
              _count: { select: { votos: true } },
            },
          },
        },
      })
    : [];

  const deviceId = await getDeviceIdReadOnly();
  const meusVotos = deviceId
    ? await prisma.enqueteVoto.findMany({
        where: { deviceId, enqueteId: { in: enquetes.map((e) => e.id) } },
        select: { enqueteId: true, opcaoId: true },
      })
    : [];
  const votoPorEnquete = new Map(meusVotos.map((v) => [v.enqueteId, v.opcaoId]));

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-bold">Melhor da Rodada</h1>

      {categorias.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
          Nenhum campeonato ativo no momento.
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          <CategoriaTabs categorias={categorias} categoriaId={categoriaId} basePath="/enquete" />

          {enquetes.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted">
              Nenhuma enquete ativa nesta categoria no momento.
            </p>
          ) : (
            enquetes.map((e) => (
              <EnqueteCard
                key={e.id}
                enqueteId={e.id}
                pergunta={e.pergunta}
                rodada={e.rodada}
                opcoesIniciais={e.opcoes.map((o) => ({
                  id: o.id,
                  atletaNome: o.atleta.nome,
                  timeNome: o.atleta.time.nome,
                  votos: o._count.votos,
                }))}
                jaVotouOpcaoId={votoPorEnquete.get(e.id) ?? null}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
