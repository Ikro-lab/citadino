import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { NovoItem } from "@/components/ui/novo-item";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  alternarInscricoes,
  createCampeonato,
  definirPrazoInscricoes,
  deleteCampeonato,
  toggleCampeonatoAtivo,
  uploadRegulamentoCampeonato,
} from "@/lib/actions/campeonatos";
import { inscricoesEncerradas } from "@/lib/prazo-inscricoes";
import { formatDataHoraCurta, formatDatetimeLocalBRT } from "@/lib/date-utils";

export default async function CampeonatosPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const campeonatos = await db.campeonato.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { categorias: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <NovoItem titulo="Novo campeonato" aberto={campeonatos.length === 0}>
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
      </NovoItem>

      <div className="flex flex-col gap-2">
        {campeonatos.map((c) => (
          <Card key={c.id} className="flex flex-col gap-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">
                  {c.nome} <span className="text-muted">· {c.temporada}</span>
                </p>
                <p className="text-xs text-muted">{c._count.categorias} {c._count.categorias === 1 ? "categoria" : "categorias"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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

            <div className="flex flex-col gap-3 border-t border-border pt-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium">Inscrições de atletas</span>
                <Badge variant={inscricoesEncerradas(c) ? "danger" : "success"}>
                  {inscricoesEncerradas(c) ? "Encerradas" : "Abertas"}
                </Badge>
                <form action={alternarInscricoes.bind(null, c.id, inscricoesEncerradas(c))}>
                  <Button type="submit" variant="secondary" size="sm">
                    {inscricoesEncerradas(c) ? "Abrir inscrições" : "Fechar inscrições"}
                  </Button>
                </form>
              </div>
              <form action={definirPrazoInscricoes.bind(null, c.id)} className="flex flex-wrap items-end gap-2">
                <div className="min-w-0 flex-1">
                  <Label htmlFor={`prazo-${c.id}`}>Fecham sozinhas em (opcional)</Label>
                  <Input
                    id={`prazo-${c.id}`}
                    name="encerramEm"
                    type="datetime-local"
                    defaultValue={c.inscricoesEncerramEm ? formatDatetimeLocalBRT(c.inscricoesEncerramEm) : ""}
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary">
                  Salvar prazo
                </Button>
              </form>
              <p className="text-xs text-muted">
                {c.inscricoesEncerramEm
                  ? `Prazo: ${formatDataHoraCurta(c.inscricoesEncerramEm)}. Para tirar o prazo, apague a data e salve.`
                  : "Sem prazo: o link de convite aceita inscrições até você fechar."}{" "}
                Fechadas, os links dos times mostram “Inscrições encerradas”.
              </p>
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
                className="flex w-full flex-wrap items-center gap-2 sm:w-auto"
              >
                <input
                  name="regulamento"
                  type="file"
                  accept="application/pdf"
                  required
                  className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-field file:px-3 file:py-1.5 file:font-medium"
                />
                <Button type="submit" size="sm" variant="secondary">
                  Enviar PDF
                </Button>
              </form>
            </div>
          </Card>
        ))}
        {campeonatos.length === 0 && (
          <EmptyState>Nenhum campeonato cadastrado. Crie o primeiro acima.</EmptyState>
        )}
      </div>
    </div>
  );
}
