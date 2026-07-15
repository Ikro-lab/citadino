import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/input";
import { aprovarSolicitacao, recusarSolicitacao } from "@/lib/actions/solicitacoes";

export default async function SolicitacoesPage() {
  const [solicitacoes, categorias] = await Promise.all([
    prisma.solicitacaoTime.findMany({
      orderBy: { createdAt: "desc" },
      include: { treinador: { select: { name: true, email: true } } },
    }),
    prisma.categoria.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-3">
      {solicitacoes.map((s) => (
        <Card key={s.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{s.nomeTime}</p>
            <p className="text-xs text-muted">
              {s.treinador.name} · {s.treinador.email}
            </p>
          </div>

          {s.status === "PENDENTE" ? (
            <div className="flex flex-wrap items-center gap-2">
              <form
                action={aprovarSolicitacao.bind(null, s.id)}
                className="flex items-center gap-2"
              >
                <Select name="categoriaId" defaultValue={s.categoriaId ?? ""} required className="w-48">
                  <option value="" disabled>
                    Categoria
                  </option>
                  {categorias.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nome}
                    </option>
                  ))}
                </Select>
                <Button type="submit" size="sm">
                  Aprovar
                </Button>
              </form>
              <form action={recusarSolicitacao.bind(null, s.id)}>
                <Button type="submit" variant="secondary" size="sm">
                  Recusar
                </Button>
              </form>
            </div>
          ) : (
            <Badge variant={s.status === "APROVADA" ? "success" : "danger"}>
              {s.status === "APROVADA" ? "Aprovada" : "Recusada"}
            </Badge>
          )}
        </Card>
      ))}
      {solicitacoes.length === 0 && (
        <p className="text-sm text-muted">Nenhuma solicitação recebida.</p>
      )}
    </div>
  );
}
