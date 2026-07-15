import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import {
  updateCategoria,
  uploadRegulamentoCategoria,
} from "@/lib/actions/categorias";
import { createGrupo, deleteGrupo, atribuirGrupoDoTime } from "@/lib/actions/grupos";

export default async function EditarCategoriaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const categoria = await prisma.categoria.findUnique({
    where: { id },
    include: {
      grupos: { include: { times: { select: { id: true, nome: true } } } },
      times: { orderBy: { nome: "asc" } },
    },
  });

  if (!categoria) notFound();

  const timesSemGrupo = categoria.times.filter((t) => !t.grupoId);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Configuração da categoria</h2>
        <form action={updateCategoria.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" defaultValue={categoria.nome} required />
          </div>
          <div>
            <Label htmlFor="formato">Formato de disputa</Label>
            <Select id="formato" name="formato" defaultValue={categoria.formato}>
              <option value="PONTOS_CORRIDOS">Pontos corridos (ou ida e volta)</option>
              <option value="GRUPOS_MATA_MATA">Fase de grupos + mata-mata</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="classificadosPorGrupo">Classificados por grupo</Label>
            <Input
              id="classificadosPorGrupo"
              name="classificadosPorGrupo"
              type="number"
              min={1}
              defaultValue={categoria.classificadosPorGrupo ?? 2}
            />
          </div>
          <div />
          <div>
            <Label htmlFor="cartoesParaSuspensao">Cartões amarelos p/ suspensão</Label>
            <Input
              id="cartoesParaSuspensao"
              name="cartoesParaSuspensao"
              type="number"
              min={1}
              defaultValue={categoria.cartoesParaSuspensao}
            />
          </div>
          <div>
            <Label htmlFor="jogosSuspensao">Jogos de suspensão</Label>
            <Input
              id="jogosSuspensao"
              name="jogosSuspensao"
              type="number"
              min={1}
              defaultValue={categoria.jogosSuspensao}
            />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Salvar</Button>
          </div>
        </form>
      </Card>

      <Card>
        <h2 className="mb-1 font-semibold">Regulamento (PDF)</h2>
        <p className="mb-3 text-xs text-muted">
          Opcional. Se não enviado aqui, o site usa o regulamento geral do campeonato.
        </p>
        {categoria.regulamentoUrl && (
          <a
            href={categoria.regulamentoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-3 inline-block text-sm text-accent underline"
          >
            Ver regulamento atual desta categoria
          </a>
        )}
        <form
          action={uploadRegulamentoCategoria.bind(null, id)}
          className="flex flex-wrap items-end gap-2"
        >
          <Input name="regulamento" type="file" accept="application/pdf" required />
          <Button type="submit" size="sm">
            Enviar
          </Button>
        </form>
      </Card>

      {categoria.formato === "GRUPOS_MATA_MATA" && (
        <Card>
          <h2 className="mb-3 font-semibold">Grupos</h2>

          <form
            action={createGrupo.bind(null, id)}
            className="mb-4 flex items-end gap-2"
          >
            <div className="flex-1">
              <Label htmlFor="nomeGrupo">Novo grupo</Label>
              <Input id="nomeGrupo" name="nome" placeholder="Grupo A" required />
            </div>
            <Button type="submit" size="sm">
              Criar
            </Button>
          </form>

          <div className="flex flex-col gap-3">
            {categoria.grupos.map((g) => (
              <div key={g.id} className="rounded-xl border border-border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-semibold">{g.nome}</p>
                  <DeleteButton action={deleteGrupo.bind(null, g.id, id)} />
                </div>
                <ul className="flex flex-col gap-1">
                  {g.times.map((t) => (
                    <li key={t.id} className="text-sm text-muted">
                      {t.nome}
                    </li>
                  ))}
                  {g.times.length === 0 && (
                    <li className="text-sm text-muted">Nenhum time neste grupo.</li>
                  )}
                </ul>
              </div>
            ))}
            {categoria.grupos.length === 0 && (
              <p className="text-sm text-muted">Nenhum grupo criado ainda.</p>
            )}
          </div>

          {timesSemGrupo.length > 0 && categoria.grupos.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-sm font-semibold">Atribuir time a um grupo</p>
              <div className="flex flex-col gap-2">
                {timesSemGrupo.map((t) => (
                  <form
                    key={t.id}
                    action={atribuirGrupoDoTime.bind(null, t.id, id)}
                    className="flex items-center gap-2"
                  >
                    <span className="flex-1 text-sm">{t.nome}</span>
                    <Select name="grupoId" defaultValue="" className="w-40">
                      <option value="" disabled>
                        Selecione o grupo
                      </option>
                      {categoria.grupos.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nome}
                        </option>
                      ))}
                    </Select>
                    <Button type="submit" size="sm">
                      Atribuir
                    </Button>
                  </form>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
