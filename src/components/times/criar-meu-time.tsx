"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FotoInput } from "@/components/ui/foto-input";
import { FormError } from "@/components/ui/form-error";
import { criarMeuTime } from "@/lib/actions/times";

/** Primeiro acesso do treinador que veio pelo link de uma categoria. */
export function CriarMeuTime({ categoriaNome }: { categoriaNome: string }) {
  const [state, formAction, pending] = useActionState(criarMeuTime, undefined);

  return (
    <Card>
      <h2 className="font-semibold">Cadastre seu time</h2>
      <p className="mt-1 mb-4 text-sm text-muted">
        Ele já fica na categoria <span className="font-semibold text-foreground">{categoriaNome}</span>.
      </p>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="nome">Nome do time</Label>
          <Input id="nome" name="nome" placeholder="Ex: Real Bairro FC" required />
        </div>
        <div>
          <Label htmlFor="escudo">Escudo do time (opcional)</Label>
          <FotoInput id="escudo" name="escudo" accept="image/*" />
          <p className="mt-1 text-xs text-muted">Sem escudo, aparecem as iniciais do time.</p>
        </div>
        <FormError message={state?.error} />
        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Criando time..." : "Criar time"}
        </Button>
      </form>
    </Card>
  );
}
