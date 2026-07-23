"use client";

import { useActionState } from "react";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { enviarAvisoGeral } from "@/lib/actions/notificacoes";

export default function BroadcastForm() {
  const [state, formAction, pending] = useActionState(enviarAvisoGeral, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <div>
        <Label htmlFor="titulo">Título</Label>
        <Input id="titulo" name="titulo" placeholder="Rodada de sábado adiada" required />
      </div>
      <div>
        <Label htmlFor="mensagem">Mensagem</Label>
        <Input id="mensagem" name="mensagem" placeholder="Adiada por causa da chuva." required />
      </div>
      {state?.message && <p className="text-sm text-muted">{state.message}</p>}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enviando..." : "Enviar aviso"}
      </Button>
    </form>
  );
}
