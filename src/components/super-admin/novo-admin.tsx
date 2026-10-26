"use client";

import { useActionState, useState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { criarAdminTenant, type CriarAdminState } from "@/lib/actions/super-admin";
import { enviarSemLimpar } from "@/lib/enviar-sem-limpar";

/** Cria mais uma conta de administrador num campeonato existente. */
export function NovoAdmin({ tenantId }: { tenantId: string }) {
  const [aberto, setAberto] = useState(false);
  const [state, formAction, pending] = useActionState(
    async (prev: CriarAdminState, formData: FormData) => {
      const res = await criarAdminTenant(tenantId, prev, formData);
      if (res?.criado) setAberto(false);
      return res;
    },
    undefined
  );

  if (!aberto) {
    return (
      <>
        <Button type="button" variant="secondary" size="sm" onClick={() => setAberto(true)}>
          Novo admin
        </Button>
        {state?.criado && (
          <p role="status" className="order-last basis-full rounded-lg bg-success/10 px-3 py-2 text-sm text-success">
            Conta criada. {state.criado.email} já pode entrar em /{state.criado.slug}/login com a senha definida.
          </p>
        )}
      </>
    );
  }

  return (
    <form
      onSubmit={enviarSemLimpar(formAction)}
      className="order-last grid basis-full gap-3 rounded-xl border border-border p-3 sm:grid-cols-3"
    >
      <div>
        <Label htmlFor={`${tenantId}-admin-nome`}>Nome</Label>
        <Input id={`${tenantId}-admin-nome`} name="name" autoComplete="off" required />
      </div>
      <div>
        <Label htmlFor={`${tenantId}-admin-email`}>E-mail</Label>
        <Input id={`${tenantId}-admin-email`} name="email" type="email" autoComplete="off" required />
      </div>
      <div>
        <Label htmlFor={`${tenantId}-admin-senha`}>Senha inicial</Label>
        <Input
          id={`${tenantId}-admin-senha`}
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={6}
          required
        />
      </div>
      <FormError message={state?.error} className="sm:col-span-3" />
      <div className="flex gap-2 sm:col-span-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Criando..." : "Criar administrador"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setAberto(false)} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
