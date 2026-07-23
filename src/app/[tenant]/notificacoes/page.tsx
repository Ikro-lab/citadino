import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { PushManager } from "@/components/push/push-manager";
import { InstallPrompt } from "@/components/push/install-prompt";

export default async function NotificacoesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [categorias, times] = await Promise.all([
    db.categoria.findMany({
      where: { campeonato: { ativo: true } },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    db.time.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, categoriaId: true },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Notificações</h1>
      <PushManager categorias={categorias} times={times} tenantId={tenant.id} />
      <InstallPrompt />
    </div>
  );
}
