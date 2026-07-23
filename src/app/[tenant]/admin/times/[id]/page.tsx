import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtletaManager } from "@/components/times/atleta-manager";
import { updateTime } from "@/lib/actions/times";

export default async function EditarTimePage({
  params,
}: {
  params: Promise<{ tenant: string; id: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [time, categorias, treinadores] = await Promise.all([
    db.time.findUnique({
      where: { id },
      include: { atletas: { orderBy: { numero: "asc" } } },
    }),
    db.categoria.findMany({ orderBy: { nome: "asc" } }),
    db.user.findMany({ where: { role: "TREINADOR" }, orderBy: { name: "asc" } }),
  ]);

  if (!time) notFound();

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <h2 className="mb-3 font-semibold">Dados do time</h2>
        <form action={updateTime.bind(null, id)} className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="nome">Nome</Label>
            <Input id="nome" name="nome" defaultValue={time.nome} required />
          </div>
          <div>
            <Label htmlFor="categoriaId">Categoria</Label>
            <Select id="categoriaId" name="categoriaId" defaultValue={time.categoriaId} required>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="treinadorId">Treinador</Label>
            <Select id="treinadorId" name="treinadorId" defaultValue={time.treinadorId ?? ""}>
              <option value="">Sem treinador vinculado</option>
              {treinadores.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.email})
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="escudoUrl">URL do escudo</Label>
            <Input id="escudoUrl" name="escudoUrl" defaultValue={time.escudoUrl ?? ""} />
          </div>
          <div className="sm:col-span-2">
            <Button type="submit">Salvar alterações</Button>
          </div>
        </form>
      </Card>

      <AtletaManager timeId={time.id} atletas={time.atletas} />
    </div>
  );
}
