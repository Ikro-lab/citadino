import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import CadastroForm from "./cadastro-form";

export default async function CadastroPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const categorias = await db.categoria.findMany({
    where: { campeonato: { ativo: true } },
    orderBy: { nome: "asc" },
    select: { id: true, nome: true },
  });

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Cadastro de treinador</h1>
      <p className="mb-6 text-sm text-muted">
        Crie sua conta para gerenciar seu elenco e partidas. Você pode
        solicitar a criação de um novo time, sujeito à aprovação do
        administrador.
      </p>
      <CadastroForm categorias={categorias} tenantSlug={tenantSlug} />
    </div>
  );
}
