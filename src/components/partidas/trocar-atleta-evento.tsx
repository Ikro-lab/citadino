"use client";

import { nomeDoAtleta } from "@/lib/labels";

/**
 * Jogador de um lance já lançado na súmula: trocar na lista salva na hora.
 * Serve para o gol lançado sem autor (ou com o autor errado) até sair a súmula física.
 */
export function TrocarAtletaEvento({
  action,
  atletaId,
  atletas,
}: {
  action: (formData: FormData) => Promise<void>;
  atletaId: string | null;
  atletas: { id: string; nome: string; apelido?: string | null; numero: number }[];
}) {
  return (
    <form action={action}>
      <select
        name="atletaId"
        defaultValue={atletaId ?? ""}
        onChange={(e) => e.currentTarget.form?.requestSubmit()}
        aria-label="Trocar o jogador do lance"
        className="h-10 max-w-48 rounded-full border border-border bg-field px-3 text-sm font-semibold"
      >
        <option value="">Sem jogador</option>
        {atletas.map((a) => (
          <option key={a.id} value={a.id}>
            #{a.numero} {nomeDoAtleta(a)}
          </option>
        ))}
      </select>
    </form>
  );
}
