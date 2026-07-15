import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AtletaManager } from "@/components/times/atleta-manager";

export default async function TreinadorPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [times, solicitacoes] = await Promise.all([
    prisma.time.findMany({
      where: { treinadorId: userId },
      include: {
        categoria: { select: { nome: true } },
        atletas: { orderBy: { numero: "asc" } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.solicitacaoTime.findMany({
      where: { treinadorId: userId, status: "PENDENTE" },
    }),
  ]);

  if (times.length === 0) {
    return (
      <Card>
        {solicitacoes.length > 0 ? (
          <>
            <p className="font-medium">Solicitação em análise</p>
            <p className="mt-1 text-sm text-muted">
              Sua solicitação para o time &quot;{solicitacoes[0].nomeTime}&quot; está
              aguardando aprovação do administrador.
            </p>
          </>
        ) : (
          <>
            <p className="font-medium">Nenhum time vinculado</p>
            <p className="mt-1 text-sm text-muted">
              Você ainda não está vinculado a nenhum time. Peça ao administrador para
              vincular um time à sua conta.
            </p>
          </>
        )}
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {times.map((time) => (
        <div key={time.id} className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">{time.nome}</h2>
            <Badge variant="accent">{time.categoria.nome}</Badge>
          </div>
          <AtletaManager timeId={time.id} atletas={time.atletas} />
        </div>
      ))}
    </div>
  );
}
