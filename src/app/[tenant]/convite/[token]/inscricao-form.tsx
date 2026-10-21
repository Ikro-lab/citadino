"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FotoInput } from "@/components/ui/foto-input";
import { FieldError, FormError } from "@/components/ui/form-error";
import { criarInscricao } from "@/lib/actions/inscricoes";
import { ehMenorDeIdade } from "@/lib/privacidade";
import { paths } from "@/lib/tenant-path";

export default function InscricaoForm({ conviteToken, tenantSlug }: { conviteToken: string; tenantSlug: string }) {
  const [state, formAction, pending] = useActionState(
    criarInscricao.bind(null, conviteToken),
    undefined
  );
  // O texto da autorização de imagem muda quando a data indica menor de 18 anos.
  // O servidor refaz essa conta: aqui é só para mostrar os campos certos.
  const [menor, setMenor] = useState(false);

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
          <Input
            id="dataNascimento"
            name="dataNascimento"
            type="date"
            autoComplete="bday"
            required
            onChange={(e) => {
              const d = e.currentTarget.valueAsDate;
              setMenor(d ? ehMenorDeIdade(d) : false);
            }}
          />
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
          <p className="mt-1 text-xs text-muted">Não aparece no site quando o atleta é menor de idade.</p>
        </div>

        <div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="aceite" required className="mt-1 size-4 shrink-0" />
            <span>
              Li a{" "}
              <Link href={paths.privacidade(tenantSlug)} target="_blank" className="font-medium text-accent underline">
                política de privacidade
              </Link>
              . Os dados servem para a inscrição e o registro do campeonato; documento e comprovante ficam privados.
            </span>
          </label>
          <FieldError errors={state?.fieldErrors?.aceite} />
        </div>

        <fieldset className="flex flex-col gap-3 rounded-lg border border-border bg-accent-soft p-3">
          <legend className="px-1 text-sm font-semibold">Autorização de uso de imagem (opcional)</legend>
          <p className="text-xs text-muted">
            Com a autorização, a foto do atleta aparece no perfil público do site, na escalação e na classificação, e os
            lances dele aparecem nos vídeos de gol, que são trechos da transmissão do campeonato no YouTube. Sem a
            autorização, o atleta joga normalmente, só que o site mostra as iniciais no lugar da foto. Dá para revogar a
            qualquer momento pelo contato da organização.
          </p>
          {menor && (
            <div>
              <Label htmlFor="responsavelNome">Nome do pai, mãe ou responsável legal</Label>
              <Input id="responsavelNome" name="responsavelNome" autoComplete="off" minLength={5} />
              <FieldError errors={state?.fieldErrors?.responsavelNome} />
            </div>
          )}
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" name="aceiteImagem" className="mt-1 size-4 shrink-0" />
            <span>
              {menor
                ? "Sou o pai, a mãe ou o responsável legal deste atleta e autorizo o uso da imagem dele no perfil público, nos vídeos de gol e na transmissão do YouTube, como descrito acima."
                : "Autorizo o uso da minha imagem no perfil público, nos vídeos de gol e na transmissão do YouTube, como descrito acima."}
            </span>
          </label>
        </fieldset>

        <FormError message={state?.error} />

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? "Enviando..." : "Enviar inscrição"}
        </Button>
      </form>
    </Card>
  );
}
