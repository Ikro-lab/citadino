"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormError } from "@/components/ui/form-error";
import { salvarDadosPrivacidade } from "@/lib/actions/privacidade";

export function PrivacidadeForm({ orgao, email }: { orgao: string; email: string }) {
  const [state, formAction, pending] = useActionState(salvarDadosPrivacidade, undefined);
  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div>
        <Label htmlFor="privacidadeOrgao">Quem organiza (controlador dos dados)</Label>
        <Input
          id="privacidadeOrgao"
          name="privacidadeOrgao"
          defaultValue={orgao}
          placeholder="Prefeitura de Cidreira, por meio da Secretaria de Esportes"
          maxLength={200}
        />
      </div>
      <div>
        <Label htmlFor="privacidadeEmail">E-mail do encarregado de dados</Label>
        <Input
          id="privacidadeEmail"
          name="privacidadeEmail"
          type="email"
          defaultValue={email}
          placeholder="lgpd@prefeitura.rs.gov.br"
        />
      </div>
      <FormError message={state?.error} />
      {state?.ok && <p className="text-sm text-success">Salvo. A política pública já mostra os novos dados.</p>}
      <Button type="submit" disabled={pending} className="sm:self-start">
        {pending ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
}
