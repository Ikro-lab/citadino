import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import InscricaoForm from "./inscricao-form";

export default async function ConvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const time = await prisma.time.findUnique({
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
