import Link from "next/link";
import { auth } from "@/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import { CriarMeuTime } from "@/components/times/criar-meu-time";
import CadastroForm from "../cadastro-form";

// Cadastro de treinador pelo link de uma categoria (Painel › Categorias):
// depois de entrar, o treinador cadastra nome e escudo do time, que nasce
// direto nessa categoria. Treinador já logado que abre o link de outra
// categoria cadastra ali mais um time, na mesma conta.
export default async function CadastroConvitePage({
  params,
}: {
  params: Promise<{ tenant: string; token: string }>;
}) {
  const { tenant: tenantSlug, token } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);
  const session = await auth();

  const categoria = await db.categoria.findFirst({
    where: { conviteTreinadorToken: token, campeonato: { ativo: true } },
    select: { id: true, nome: true, campeonato: { select: { nome: true } } },
  });

  const treinadorLogado =
    session?.user.role === "TREINADOR" && session.user.tenantId === tenant.id ? session.user : null;
  const timeNaCategoria =
    treinadorLogado && categoria
      ? await db.time.findFirst({
          where: { categoriaId: categoria.id, treinadorId: treinadorLogado.id },
          select: { nome: true },
        })
      : null;

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">
        {treinadorLogado ? "Novo time" : "Cadastro de treinador"}
      </h1>
      {!categoria ? (
        <Card className="mt-4">
          <p className="font-medium">Link de cadastro inválido</p>
          <p className="mt-1 text-sm text-muted">Este link não existe mais ou foi trocado. Peça um novo ao organizador do campeonato.</p>
        </Card>
      ) : treinadorLogado ? (
        <>
          <p className="mb-6 text-sm text-muted">
            {categoria.campeonato.nome} · <span className="font-semibold text-foreground">{categoria.nome}</span>
            <br />
            Você está como <span className="font-semibold text-foreground">{treinadorLogado.name}</span>. O time
            entra na sua conta, junto com os que você já tem.
          </p>
          {timeNaCategoria ? (
            <Card>
              <p className="font-medium">Você já tem um time nesta categoria</p>
              <p className="mt-1 text-sm text-muted">
                &quot;{timeNaCategoria.nome}&quot; já está em {categoria.nome}.{" "}
                <Link href={paths.treinador.root(tenantSlug)} className="font-semibold text-accent">
                  Ver meus times
                </Link>
              </p>
            </Card>
          ) : (
            <CriarMeuTime categoriaNome={categoria.nome} conviteTreinador={token} titulo="Cadastre mais um time" />
          )}
        </>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted">
            {categoria.campeonato.nome} · <span className="font-semibold text-foreground">{categoria.nome}</span>
            <br />
            Crie sua conta. Depois de entrar, você cadastra o nome e o escudo do seu time, que já fica nesta categoria.
            Já é treinador de outro time? Entre com a sua conta e o novo time fica junto com ele.
          </p>
          <CadastroForm categorias={[]} tenantSlug={tenantSlug} conviteTreinador={token} />
        </>
      )}
    </div>
  );
}
