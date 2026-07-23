import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { createCategoria, deleteCategoria } from "@/lib/actions/categorias";

export default async function CategoriasPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [categorias, campeonatos] = await Promise.all([
    db.categoria.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        campeonato: { select: { nome: true } },
        _count: { select: { times: true, partidas: true } },
      },
    }),
    db.campeonato.findMany({ orderBy: { nome: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Nova categoria</h2>
        {campeonatos.length === 0 ? (
          <p className="text-sm text-muted">
            Crie um campeonato antes de adicionar categorias.
          </p>
        ) : (
          <form action={createCategoria} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" placeholder="Masculino Livre" required />
            </div>
            <div className="flex-1">
              <Label htmlFor="campeonatoId">Campeonato</Label>
              <Select id="campeonatoId" name="campeonatoId" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {campeonatos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} ({c.temporada})
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit">Criar</Button>
          </form>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        {categorias.map((c) => (
          <Card key={c.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">
                {c.nome}{" "}
                {c.formato === "GRUPOS_MATA_MATA" && (
                  <Badge variant="accent">Grupos + mata-mata</Badge>
                )}
              </p>
              <p className="text-xs text-muted">
                {c.campeonato.nome} · {c._count.times} times · {c._count.partidas} partidas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={paths.admin.categoria(tenantSlug, c.id)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft"
              >
                Gerenciar
              </Link>
              <DeleteButton action={deleteCategoria.bind(null, c.id)} />
            </div>
          </Card>
        ))}
        {categorias.length === 0 && (
          <p className="text-sm text-muted">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
}
