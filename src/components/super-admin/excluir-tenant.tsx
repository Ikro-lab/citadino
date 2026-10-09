"use client";

import { useActionState, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { excluirTenant } from "@/lib/actions/super-admin";

/** Exclusão definitiva de um tenant: pede para digitar o slug. */
export function ExcluirTenant({ id, slug }: { id: string; slug: string }) {
  const [aberto, setAberto] = useState(false);
  const [state, formAction, pending] = useActionState(excluirTenant.bind(null, id), undefined);

  if (!aberto) {
    return (
      <Button type="button" variant="danger" size="sm" onClick={() => setAberto(true)}>
        Excluir
      </Button>
    );
  }

  return (
    <form action={formAction} className="flex w-full flex-col gap-2 rounded-xl border border-danger/40 bg-danger/5 p-3">
      <p className="text-sm">
        Apaga <strong>tudo</strong> deste campeonato: times, atletas, jogos, lances, enquetes, patrocinadores e contas de
        usuário. Não dá para desfazer. Digite <strong>{slug}</strong> para confirmar:
      </p>
      <Input name="confirmacao" autoComplete="off" placeholder={slug} required />
      <FormError message={state?.error} />
      <div className="flex gap-2">
        <Button type="submit" variant="danger" size="sm" disabled={pending}>
          {pending ? "Excluindo..." : "Excluir definitivamente"}
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={() => setAberto(false)} disabled={pending}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
