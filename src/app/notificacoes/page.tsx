import { prisma } from "@/lib/prisma";
import { PushManager } from "@/components/push/push-manager";
import { InstallPrompt } from "@/components/push/install-prompt";

export default async function NotificacoesPage() {
  const [categorias, times] = await Promise.all([
    prisma.categoria.findMany({
      where: { campeonato: { ativo: true } },
      orderBy: { nome: "asc" },
      select: { id: true, nome: true },
    }),
    prisma.time.findMany({
      orderBy: { nome: "asc" },
      select: { id: true, nome: true, categoriaId: true },
    }),
  ]);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
      <h1 className="text-2xl font-bold">Notificações</h1>
      <PushManager categorias={categorias} times={times} />
      <InstallPrompt />
    </div>
  );
}
