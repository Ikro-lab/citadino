"use client";

import { useActionState } from "react";
import { createTenantComAdmin } from "@/lib/actions/super-admin";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function NovoTenantPage() {
  const [state, formAction, pending] = useActionState(createTenantComAdmin, undefined);

  if (state?.success) {
    return (
      <Card>
        <p className="font-medium text-success">Tenant criado com sucesso!</p>
        <p className="mt-1 text-sm text-muted">
          O administrador já pode fazer login na URL do tenant (/&lt;slug&gt;/login).
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="mb-3 font-semibold">Novo cliente</h2>
      <form action={formAction} className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="nome">Nome do cliente</Label>
          <Input id="nome" name="nome" placeholder="Liga Municipal de Futsal" required />
        </div>
        <div>
          <Label htmlFor="slug">Slug (URL)</Label>
          <Input id="slug" name="slug" placeholder="liga-municipal" pattern="[a-z0-9-]+" required />
        </div>
        <div>
          <Label htmlFor="adminName">Nome do administrador</Label>
          <Input id="adminName" name="adminName" required />
        </div>
        <div>
          <Label htmlFor="adminEmail">E-mail do administrador</Label>
          <Input id="adminEmail" name="adminEmail" type="email" required />
        </div>
        <div>
          <Label htmlFor="adminPassword">Senha inicial</Label>
          <Input id="adminPassword" name="adminPassword" type="password" minLength={6} required />
        </div>

        {state?.error && (
          <p className="sm:col-span-2 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}

        <div className="sm:col-span-2">
          <Button type="submit" disabled={pending}>
            {pending ? "Criando..." : "Criar cliente"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
