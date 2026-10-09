import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import CadastroForm from "../cadastro-form";

// Cadastro de treinador pelo link de uma categoria (Painel › Categorias):
// depois de entrar, o treinador cadastra nome e escudo do time, que nasce
// direto nessa categoria.
export default async function CadastroConvitePage({
  params,
}: {
  params: Promise<{ tenant: string; token: string }>;
}) {
  const { tenant: tenantSlug, token } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const categoria = await db.categoria.findFirst({
    where: { conviteTreinadorToken: token, campeonato: { ativo: true } },
    select: { nome: true, campeonato: { select: { nome: true } } },
  });

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Cadastro de treinador</h1>
      {categoria ? (
        <>
          <p className="mb-6 text-sm text-muted">
            {categoria.campeonato.nome} · <span className="font-semibold text-foreground">{categoria.nome}</span>
            <br />
            Crie sua conta. Depois de entrar, você cadastra o nome e o escudo do seu time, que já fica nesta categoria.
          </p>
          <CadastroForm categorias={[]} tenantSlug={tenantSlug} conviteTreinador={token} />
        </>
      ) : (
        <Card className="mt-4">
          <p className="font-medium">Link de cadastro inválido</p>
          <p className="mt-1 text-sm text-muted">Este link não existe mais ou foi trocado. Peça um novo ao organizador do campeonato.</p>
        </Card>
      )}
    </div>
  );
}
