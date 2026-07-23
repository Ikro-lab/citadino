"use client";

import { useActionState } from "react";
import { loginSuperAdmin } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function SuperAdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginSuperAdmin, undefined);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold">Painel da Plataforma</h1>
      <p className="mb-6 text-sm text-muted">Acesso restrito à equipe do Citadino.</p>

      <Card>
        <form action={formAction} className="flex flex-col gap-4">
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
    </div>
  );
}
