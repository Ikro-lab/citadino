import Link from "next/link";
import type { Metadata } from "next";
import { getTenantBySlug } from "@/lib/tenant";
import { usuarioDoLinkSenha } from "@/lib/link-senha";
import { paths } from "@/lib/tenant-path";
import { Card } from "@/components/ui/card";
import NovaSenhaForm from "./nova-senha-form";

export const metadata: Metadata = { title: "Nova senha", robots: { index: false } };

/** Link de nova senha que o admin gerou e mandou para o treinador. */
export default async function RedefinirSenhaPage({
  params,
}: {
  params: Promise<{ tenant: string; token: string }>;
}) {
  const { tenant: tenantSlug, token } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const usuario = await usuarioDoLinkSenha(tenant.id, token);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-2xl font-semibold tracking-tight">Nova senha</h1>
      {usuario ? (
        <>
          <p className="mb-6 text-sm text-muted">
            {usuario.name}, crie a senha da conta <span className="font-semibold text-foreground">{usuario.email}</span>.
          </p>
          <Card>
            <NovaSenhaForm tenantSlug={tenantSlug} token={token} email={usuario.email} />
          </Card>
        </>
      ) : (
        <Card>
          <p className="text-sm">Este link não vale mais: ele já foi usado, passou de 48 horas ou foi trocado por um novo.</p>
          <p className="mt-2 text-sm text-muted">Peça um novo link ao organizador do campeonato.</p>
          <Link href={paths.login(tenantSlug)} className="mt-4 inline-block text-sm font-semibold text-accent">
            Ir para o login
          </Link>
        </Card>
      )}
    </div>
  );
}
