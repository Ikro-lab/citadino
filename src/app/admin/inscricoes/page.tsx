import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calcularIdade } from "@/lib/utils";
import { revogarInscricao } from "@/lib/actions/inscricoes";

const statusVariant = {
  PENDENTE: "neutral",
  APROVADA: "success",
  RECUSADA: "danger",
} as const;

export default async function AdminInscricoesPage() {
  const inscricoes = await prisma.inscricaoAtleta.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      time: { select: { nome: true, categoria: { select: { nome: true } } } },
    },
  });

  return (
    <div className="flex flex-col gap-3">
      {inscricoes.map((i) => (
        <Card key={i.id} className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">
              {i.nome} <span className="text-muted">· {calcularIdade(i.dataNascimento)} anos</span>
            </p>
            <p className="text-xs text-muted">
              {i.time.nome} · {i.time.categoria.nome}
            </p>
            <div className="mt-1 flex gap-3 text-xs">
              <a href={i.documentoUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                Documento
              </a>
              <a href={i.comprovanteEnderecoUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">
                Comprovante
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[i.status]}>{i.status}</Badge>
            {i.status === "APROVADA" && (
              <form action={revogarInscricao.bind(null, i.id)}>
                <Button type="submit" variant="danger" size="sm">
                  Revogar
                </Button>
              </form>
            )}
          </div>
        </Card>
      ))}
      {inscricoes.length === 0 && (
        <p className="text-sm text-muted">Nenhuma inscrição recebida ainda.</p>
      )}
    </div>
  );
}
