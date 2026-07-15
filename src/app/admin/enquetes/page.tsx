import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { EnqueteForm } from "@/components/enquetes/enquete-form";
import { toggleEnqueteAtiva, deleteEnquete } from "@/lib/actions/enquetes";

export default async function AdminEnquetesPage() {
  const [enquetes, categorias, atletas] = await Promise.all([
    prisma.enquete.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categoria: { select: { nome: true } },
        opcoes: { include: { _count: { select: { votos: true } } } },
      },
    }),
    prisma.categoria.findMany({ orderBy: { nome: "asc" } }),
    prisma.atleta.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, timeId: true, time: { select: { nome: true, categoriaId: true } } },
    }),
  ]);

  const atletasFormatados = atletas.map((a) => ({
    id: a.id,
    nome: a.nome,
    timeNome: a.time.nome,
    categoriaId: a.time.categoriaId,
  }));

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Nova enquete</h2>
        <EnqueteForm categorias={categorias} atletas={atletasFormatados} />
      </Card>

      <div className="flex flex-col gap-2">
        {enquetes.map((e) => {
          const totalVotos = e.opcoes.reduce((acc, o) => acc + o._count.votos, 0);
          return (
            <Card key={e.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {e.pergunta} <span className="text-muted">· Rodada {e.rodada}</span>
                </p>
                <p className="text-xs text-muted">
                  {e.categoria.nome} · {e.opcoes.length} opções · {totalVotos} votos
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={e.ativa ? "success" : "neutral"}>{e.ativa ? "Ativa" : "Encerrada"}</Badge>
                <form action={toggleEnqueteAtiva.bind(null, e.id, !e.ativa)}>
                  <Button type="submit" variant="secondary" size="sm">
                    {e.ativa ? "Encerrar" : "Reativar"}
                  </Button>
                </form>
                <DeleteButton action={deleteEnquete.bind(null, e.id)} />
              </div>
            </Card>
          );
        })}
        {enquetes.length === 0 && <p className="text-sm text-muted">Nenhuma enquete criada ainda.</p>}
      </div>
    </div>
  );
}
