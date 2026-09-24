"use client";

import { useActionState } from "react";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FotoInput } from "@/components/ui/foto-input";
import { FieldError, FormError } from "@/components/ui/form-error";
import { criarInscricao } from "@/lib/actions/inscricoes";

export default function InscricaoForm({ conviteToken }: { conviteToken: string }) {
  const [state, formAction, pending] = useActionState(
    criarInscricao.bind(null, conviteToken),
    undefined
  );

  if (state?.success) {
    return (
      <Card>
        <p className="font-medium text-success">Inscrição enviada</p>
        <p className="mt-1 text-sm text-muted">
          O treinador vai revisar seus dados e aprovar sua entrada no elenco.
        </p>
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="nome">Nome completo</Label>
          <Input id="nome" name="nome" autoComplete="name" required />
          <FieldError errors={state?.fieldErrors?.nome} />
        </div>

        <div>
          <Label htmlFor="dataNascimento">Data de nascimento</Label>
          <Input id="dataNascimento" name="dataNascimento" type="date" autoComplete="bday" required />
          <FieldError errors={state?.fieldErrors?.dataNascimento} />
        </div>

        <div>
          <Label htmlFor="foto">Foto do atleta</Label>
          <FotoInput id="foto" name="foto" accept="image/*" required />
        </div>

        <div>
          <Label htmlFor="documento">Foto do documento de identidade</Label>
          <FotoInput id="documento" name="documento" accept="image/*" required />
        </div>

        <div>
          <Label htmlFor="comprovanteEndereco">Comprovante de endereço</Label>
          <FotoInput id="comprovanteEndereco" name="comprovanteEndereco" accept="image/*,application/pdf" required />
        </div>

        <div>
          <Label htmlFor="instagram">Instagram (opcional)</Label>
          <Input id="instagram" name="instagram" placeholder="@seuinstagram" autoCapitalize="none" />
        </div>

        <FormError message={state?.error} />

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Enviando..." : "Enviar inscrição"}
        </Button>
      </form>
    </Card>
  );
}
