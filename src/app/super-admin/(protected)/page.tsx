import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toggleTenantAtivo } from "@/lib/actions/super-admin";

export default async function SuperAdminDashboard() {
  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { users: true, campeonatos: true, times: true } } },
  });

  return (
    <div className="flex flex-col gap-3">
      {tenants.map((t) => (
        <Card key={t.id} className="flex items-center justify-between">
          <div>
            <p className="font-medium">
              {t.nome} <span className="text-muted">· /{t.slug}</span>
            </p>
            <p className="text-xs text-muted">
              {t._count.users} usuário(s) · {t._count.campeonatos} campeonato(s) · {t._count.times} time(s)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={t.ativo ? "success" : "neutral"}>{t.ativo ? "Ativo" : "Inativo"}</Badge>
            <form action={toggleTenantAtivo.bind(null, t.id, !t.ativo)}>
              <Button type="submit" variant="secondary" size="sm">
                {t.ativo ? "Desativar" : "Ativar"}
              </Button>
            </form>
          </div>
        </Card>
      ))}
      {tenants.length === 0 && (
        <p className="text-sm text-muted">Nenhum tenant cadastrado ainda.</p>
      )}
    </div>
  );
}
