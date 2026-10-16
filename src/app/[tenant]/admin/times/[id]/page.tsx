import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AtletaManager } from "@/components/times/atleta-manager";
import { Escudo } from "@/components/times/escudo";
import { FormError } from "@/components/ui/form-error";
import { FotoInput } from "@/components/ui/foto-input";
import { removerEscudo, updateTime } from "@/lib/actions/times";

export default async function EditarTimePage({
  params,
  searchParams,
}: {
  params: Promise<{ tenant: string; id: string }>;
  searchParams: Promise<{ erro?: string }>;
}) {
  const { tenant: tenantSlug, id } = await params;
  const { erro } = await searchParams;
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
            <Label htmlFor="escudo">Escudo</Label>
            <div className="flex items-center gap-3">
              <Escudo nome={time.nome} escudoUrl={time.escudoUrl} size={64} className="rounded-md border border-border" />
              <FotoInput id="escudo" name="escudo" accept="image/*" className="flex-1" />
            </div>
            <p className="mt-1 text-xs text-muted">
              {time.escudoUrl
                ? "Para trocar, escolha a imagem nova e toque em Salvar alterações."
                : "Nenhum escudo ainda: aparecem as iniciais."}
            </p>
            {time.escudoUrl && (
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <a href={`/api/${tenantSlug}/times/${id}/escudo`} className="font-medium text-accent hover:underline">
                  Baixar escudo
                </a>
                <button
                  type="submit"
                  formAction={removerEscudo.bind(null, id)}
                  formNoValidate
                  className="font-medium text-danger hover:underline"
                >
                  Remover escudo
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:col-span-2">
            <FormError message={erro} />
            <Button type="submit" className="self-start">Salvar alterações</Button>
          </div>
        </form>
      </Card>

      <AtletaManager timeId={time.id} atletas={time.atletas} mostrarAnexos />
    </div>
  );
}
