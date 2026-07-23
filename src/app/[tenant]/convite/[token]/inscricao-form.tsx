"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { criarInscricao } from "@/lib/actions/inscricoes";

export default function InscricaoForm({ conviteToken }: { conviteToken: string }) {
  const [state, formAction, pending] = useActionState(
    criarInscricao.bind(null, conviteToken),
    undefined
  );

  if (state?.success) {
    return (
      <Card>
        <p className="font-medium text-success">Inscrição enviada!</p>
        <p className="mt-1 text-sm text-muted">
          O treinador vai revisar seus dados e aprovar sua entrada no elenco em breve.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" name="nome" required />
          {state?.fieldErrors?.nome && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.nome[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="dataNascimento">Data de nascimento</Label>
          <Input id="dataNascimento" name="dataNascimento" type="date" required />
          {state?.fieldErrors?.dataNascimento && (
            <p className="mt-1 text-xs text-danger">{state.fieldErrors.dataNascimento[0]}</p>
          )}
        </div>

        <div>
          <Label htmlFor="foto">Foto do atleta</Label>
          <Input id="foto" name="foto" type="file" accept="image/*" required />
        </div>

        <div>
          <Label htmlFor="documento">Documento de identificação (foto)</Label>
          <Input id="documento" name="documento" type="file" accept="image/*" required />
        </div>

        <div>
          <Label htmlFor="comprovanteEndereco">Comprovante de endereço</Label>
          <Input
            id="comprovanteEndereco"
            name="comprovanteEndereco"
            type="file"
            accept="image/*,application/pdf"
            required
          />
        </div>

        <div>
          <Label htmlFor="instagram">Instagram (opcional)</Label>
          <Input id="instagram" name="instagram" placeholder="@seuinstagram" />
        </div>

        {state?.error && (
          <p className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>
        )}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Enviando..." : "Enviar inscrição"}
        </Button>
      </form>
    </Card>
  );
}
