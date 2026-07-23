import Link from "next/link";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/ui/delete-button";
import { createTime, deleteTime } from "@/lib/actions/times";

export default async function TimesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [times, categorias, treinadores] = await Promise.all([
    db.time.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        categoria: { select: { nome: true } },
        treinador: { select: { name: true } },
        _count: { select: { atletas: true } },
      },
    }),
    db.categoria.findMany({ orderBy: { nome: "asc" } }),
    db.user.findMany({ where: { role: "TREINADOR" }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Novo time</h2>
        {categorias.length === 0 ? (
          <p className="text-sm text-muted">Crie uma categoria antes de adicionar times.</p>
        ) : (
          <form action={createTime} className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor="nome">Nome do time</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div>
              <Label htmlFor="categoriaId">Categoria</Label>
              <Select id="categoriaId" name="categoriaId" required defaultValue="">
                <option value="" disabled>
                  Selecione
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="treinadorId">Treinador (opcional)</Label>
              <Select id="treinadorId" name="treinadorId" defaultValue="">
                <option value="">Sem treinador vinculado</option>
                {treinadores.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.email})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="escudoUrl">URL do escudo (opcional)</Label>
              <Input id="escudoUrl" name="escudoUrl" placeholder="https://..." />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Criar time</Button>
            </div>
          </form>
        )}
      </Card>

      <div className="flex flex-col gap-2">
        {times.map((t) => (
          <Card key={t.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium">{t.nome}</p>
              <p className="text-xs text-muted">
                {t.categoria.nome} · {t._count.atletas} atletas ·{" "}
                {t.treinador ? t.treinador.name : "sem treinador"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={paths.admin.time(tenantSlug, t.id)}
                className="rounded-lg px-3 py-1.5 text-sm font-semibold text-accent hover:bg-accent-soft"
              >
                Gerenciar
              </Link>
              <DeleteButton action={deleteTime.bind(null, t.id)} />
            </div>
          </Card>
        ))}
        {times.length === 0 && <p className="text-sm text-muted">Nenhum time cadastrado.</p>}
      </div>
    </div>
  );
}
