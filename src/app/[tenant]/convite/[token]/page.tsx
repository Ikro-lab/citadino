import { notFound } from "next/navigation";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import InscricaoForm from "./inscricao-form";

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ tenant: string; token: string }>;
}) {
  const { tenant: tenantSlug, token } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const time = await db.time.findUnique({
    where: { conviteToken: token },
    include: { categoria: { select: { nome: true } } },
  });

  if (!time) notFound();

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Inscrição de atleta</h1>
      <p className="mb-6 text-sm text-muted">
        {time.nome} · {time.categoria.nome}
      </p>

      <Card className="mb-4 bg-accent-soft">
        <p className="text-xs text-muted">
          Seus documentos são usados apenas para validar a inscrição junto ao
          treinador/administrador do campeonato e nunca aparecem publicamente.
          Você pode pedir a exclusão dos seus dados a qualquer momento junto ao
          administrador.
        </p>
      </Card>

      <InscricaoForm conviteToken={token} />
    </div>
  );
}
