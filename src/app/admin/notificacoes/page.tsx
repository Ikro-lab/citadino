import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import BroadcastForm from "./broadcast-form";

export default async function NotificacoesPage() {
  const total = await prisma.pushSubscription.count();

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
