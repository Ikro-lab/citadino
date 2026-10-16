import Link from "next/link";
import { auth } from "@/auth";
import { getTenantBySlug } from "@/lib/tenant";
import { getTenantPrisma } from "@/lib/tenant-prisma";
import { paths } from "@/lib/tenant-path";
import { treinadorTemTimeNaCategoria } from "@/lib/treinador-categoria";
import { usarLinkCategoria } from "@/lib/actions/times";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CadastroForm from "../cadastro-form";

// Cadastro de treinador pelo link de uma categoria (Painel › Categorias):
// depois de entrar, o treinador cadastra nome e escudo do time, que nasce
// direto nessa categoria. Quem já tem conta usa o mesmo link para criar um
// time em outra categoria (um treinador pode ter um time por categoria).
export default async function CadastroConvitePage({
  params,
}: {
  params: Promise<{ tenant: string; token: string }>;
}) {
  const { tenant: tenantSlug, token } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const db = getTenantPrisma(tenant.id);

  const [categoria, session] = await Promise.all([
    db.categoria.findFirst({
      where: { conviteTreinadorToken: token, campeonato: { ativo: true } },
      select: { id: true, nome: true, campeonato: { select: { nome: true } } },
    }),
    auth(),
  ]);

  const treinadorLogado =
    session?.user?.role === "TREINADOR" && session.user.tenantId === tenant.id ? session.user : null;
  const jaTemTime =
    categoria && treinadorLogado ? await treinadorTemTimeNaCategoria(db, treinadorLogado.id, categoria.id) : false;

  return (
    <div className="mx-auto max-w-sm px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Cadastro de treinador</h1>
      {!categoria ? (
        <Card className="mt-4">
          <p className="font-medium">Link de cadastro inválido</p>
          <p className="mt-1 text-sm text-muted">Este link não existe mais ou foi trocado. Peça um novo ao organizador do campeonato.</p>
        </Card>
      ) : treinadorLogado ? (
        <>
          <p className="mb-6 text-sm text-muted">
            {categoria.campeonato.nome} · <span className="font-semibold text-foreground">{categoria.nome}</span>
          </p>
          <Card>
            {jaTemTime ? (
              <>
                <p className="font-medium">Você já tem um time nesta categoria</p>
                <p className="mt-1 text-sm text-muted">
                  Cada treinador pode ter um time por categoria. Para outro time, use o link de outra categoria.
                </p>
                <Link href={paths.treinador.root(tenantSlug)} className="mt-4 inline-block text-sm font-semibold text-accent">
                  Ir para meus times
                </Link>
              </>
            ) : (
              <form action={usarLinkCategoria.bind(null, token)} className="flex flex-col gap-3">
                <p className="text-sm text-muted">
                  Você está conectado como <span className="font-semibold text-foreground">{treinadorLogado.name}</span>.
                  Cadastre mais um time, que já fica nesta categoria.
                </p>
                <Button type="submit" className="w-full">
                  Cadastrar time nesta categoria
                </Button>
              </form>
            )}
          </Card>
        </>
      ) : (
        <>
          <p className="mb-6 text-sm text-muted">
            {categoria.campeonato.nome} · <span className="font-semibold text-foreground">{categoria.nome}</span>
            <br />
            Crie sua conta. Depois de entrar, você cadastra o nome e o escudo do seu time, que já fica nesta categoria.
          </p>
          <CadastroForm categorias={[]} tenantSlug={tenantSlug} conviteTreinador={token} />
        </>
      )}
    </div>
  );
}
