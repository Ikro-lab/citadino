import { prisma } from "@/lib/prisma";
import CadastroForm from "./cadastro-form";

export default async function CadastroPage() {
  const categorias = await prisma.categoria.findMany({
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
      <CadastroForm categorias={categorias} />
    </div>
  );
}
