"use client";

import { useActionState } from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { redefinirSenha } from "@/lib/actions/senha";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldError, FormError } from "@/components/ui/form-error";
import { paths } from "@/lib/tenant-path";

export default function NovaSenhaForm({ tenantSlug, token, email }: { tenantSlug: string; token: string; email: string }) {
  const [state, formAction, pending] = useActionState(redefinirSenha, undefined);

  if (state?.ok) {
    return (
      <div className="flex flex-col gap-3">
        <p className="flex items-start gap-2 text-sm text-success">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          Senha alterada. Entre com o e-mail {email} e a senha nova.
        </p>
        <Link href={paths.login(tenantSlug)} className="flex h-11 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground hover:bg-accent-dark">
          Entrar
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="tenantSlug" value={tenantSlug} />
      <input type="hidden" name="token" value={token} />
      {/* Para o gerenciador de senhas do celular salvar junto com o e-mail certo. */}
      <input type="hidden" name="username" value={email} autoComplete="username" />

      <div>
        <Label htmlFor="password">Senha nova</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={6} required />
        <FieldError errors={state?.fieldErrors?.password} />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Repita a senha</Label>
        <Input id="confirmPassword" name="confirmPassword" type="password" autoComplete="new-password" required />
        <FieldError errors={state?.fieldErrors?.confirmPassword} />
      </div>

      <FormError message={state?.error} />

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Salvando..." : "Salvar senha"}
      </Button>
    </form>
  );
}
