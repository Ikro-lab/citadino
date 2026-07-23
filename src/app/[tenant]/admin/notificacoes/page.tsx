import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { Card } from "@/components/ui/card";
import BroadcastForm from "./broadcast-form";

export default async function NotificacoesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  const { tenant: tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const total = await db.pushSubscription.count();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="mb-1 font-semibold">Aviso geral</h2>
        <p className="mb-4 text-sm text-muted">
          Envie um aviso push para todos os {total} torcedor(es) inscrito(s), independente de
          categoria ou time.
        </p>
        <BroadcastForm />
      </Card>
    </div>
  );
}
