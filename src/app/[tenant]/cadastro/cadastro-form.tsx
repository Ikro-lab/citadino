"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { cadastroTreinador } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError, FormError } from "@/components/ui/form-error";
import { paths } from "@/lib/tenant-path";

export default function CadastroForm({
  categorias,
  tenantSlug,
}: {
  categorias: { id: string; nome: string }[];
  tenantSlug: string;
}) {
  const [state, formAction, pending] = useActionState(cadastroTreinador, undefined);
  const [querTime, setQuerTime] = useState(false);

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="tenantSlug" value={tenantSlug} />
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" name="name" autoComplete="name" required />
          <FieldError errors={state?.fieldErrors?.name} />
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" autoComplete="email" required />
          <FieldError errors={state?.fieldErrors?.email} />
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" autoComplete="new-password" required />
          <FieldError errors={state?.fieldErrors?.password} />
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
          />
          <FieldError errors={state?.fieldErrors?.confirmPassword} />
        </div>

        <label className="flex min-h-11 items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={querTime}
            onChange={(e) => setQuerTime(e.target.checked)}
            className="h-5 w-5 shrink-0 accent-accent"
          />
          Quero pedir a criação de um novo time
        </label>

        {querTime && (
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-field p-3">
            <div>
              <Label htmlFor="nomeTime">Nome do time</Label>
              <Input id="nomeTime" name="nomeTime" placeholder="Ex: Real Bairro FC" />
            </div>
            <div>
              <Label htmlFor="categoriaId">Categoria</Label>
              <Select id="categoriaId" name="categoriaId" defaultValue="">
                <option value="" disabled>
                  Selecione a categoria
                </option>
                {categorias.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        )}

        <FormError message={state?.error} />

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href={paths.login(tenantSlug)} className="font-semibold text-accent">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
