"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { cadastroTreinador } from "@/lib/actions/auth";
import { Card } from "@/components/ui/card";
import { Input, Label, Select } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function CadastroForm({
  categorias,
}: {
  categorias: { id: string; nome: string }[];
}) {
  const [state, formAction, pending] = useActionState(cadastroTreinador, undefined);
  const [querTime, setQuerTime] = useState(false);

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" name="name" required />
          {state?.fieldErrors?.name && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email">E-mail</Label>
          <Input id="email" name="email" type="email" required />
          {state?.fieldErrors?.email && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="password">Senha</Label>
          <Input id="password" name="password" type="password" required />
          {state?.fieldErrors?.password && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirmar senha</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required />
          {state?.fieldErrors?.confirmPassword && (
            <p className="mt-1 text-xs text-danger">
              {state.fieldErrors.confirmPassword[0]}
            </p>
          )}
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={querTime}
            onChange={(e) => setQuerTime(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          Quero solicitar a criação de um novo time
        </label>

        {querTime && (
          <div className="flex flex-col gap-4 rounded-xl bg-surface p-3">
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

        {state?.error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">
            {state.error}
          </p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-muted">
        Já tem conta?{" "}
        <Link href="/login" className="font-semibold text-accent">
          Entrar
        </Link>
      </p>
    </Card>
  );
}
