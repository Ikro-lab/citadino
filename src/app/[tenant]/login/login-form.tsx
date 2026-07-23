"use client";

import { useActionState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { paths } from "@/lib/tenant-path";

export default function LoginForm({ tenantSlug }: { tenantSlug: string }) {
  const [state, formAction, pending] = useActionState(login, undefined);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? paths.home(tenantSlug);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Entrar</h1>
      <p className="mb-6 text-sm text-muted">
        Acesso restrito para administradores e treinadores.
      </p>

      <Card>
        <form action={formAction} className="flex flex-col gap-4">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <input type="hidden" name="tenantSlug" value={tenantSlug} />

          <div>
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" name="email" type="email" autoComplete="email" required />
          </div>

          <div>
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
            />
          </div>

          {state?.error && (
            <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {state.error}
            </p>
          )}

          <Button type="submit" disabled={pending} className="w-full">
            {pending ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>

      <p className="mt-6 text-center text-sm text-muted">
        É treinador e ainda não tem conta?{" "}
        <Link href={paths.cadastro(tenantSlug)} className="font-semibold text-accent">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
