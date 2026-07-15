import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  createCampeonato,
  deleteCampeonato,
  toggleCampeonatoAtivo,
  uploadRegulamentoCampeonato,
} from "@/lib/actions/campeonatos";

export default async function CampeonatosPage() {
  const campeonatos = await prisma.campeonato.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { categorias: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Novo campeonato</h2>
        <form action={createCampeonato} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" placeholder="Campeonato Citadino" required />
          </div>
          <div className="flex-1">
            <Label htmlFor="temporada">Temporada</Label>
            <Input id="temporada" name="temporada" placeholder="2026" required />
          </div>
          <Button type="submit">Criar</Button>
        </form>
      </Card>

      <div className="flex flex-col gap-2">
        {campeonatos.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {c.nome} <span className="text-muted">· {c.temporada}</span>
                </p>
                <p className="text-xs text-muted">{c._count.categorias} categorias</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={c.ativo ? "success" : "neutral"}>
                  {c.ativo ? "Ativo" : "Inativo"}
                </Badge>
                <form action={toggleCampeonatoAtivo.bind(null, c.id, !c.ativo)}>
                  <Button type="submit" variant="secondary" size="sm">
                    {c.ativo ? "Desativar" : "Ativar"}
                  </Button>
                </form>
                <DeleteButton action={deleteCampeonato.bind(null, c.id)} />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {c.regulamentoUrl ? (
                <a
                  href={c.regulamentoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-accent underline"
                >
                  Ver regulamento atual
                </a>
              ) : (
                <span className="text-xs text-muted">Sem regulamento enviado</span>
              )}
              <form
                action={uploadRegulamentoCampeonato.bind(null, c.id)}
                className="flex items-center gap-2"
              >
                <input
                  name="regulamento"
                  type="file"
                  accept="application/pdf"
                  required
                  className="text-xs"
                />
                <Button type="submit" size="sm" variant="secondary">
                  Enviar PDF
                </Button>
              </form>
            </div>
          </Card>
        ))}
        {campeonatos.length === 0 && (
          <p className="text-sm text-muted">Nenhum campeonato cadastrado.</p>
        )}
      </div>
    </div>
  );
}
