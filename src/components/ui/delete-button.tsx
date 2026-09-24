"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

/**
 * Exclusão em dois toques, sem o confirm() nativo do navegador: o primeiro
 * toque troca a lixeira por "Remover" / "Cancelar" no próprio lugar.
 */
export function DeleteButton({
  action,
  label = "Remover",
}: {
  action: () => Promise<void>;
  label?: string;
}) {
  const [confirmando, setConfirmando] = useState(false);

  if (!confirmando) {
    return (
      <button
        type="button"
        onClick={() => setConfirmando(true)}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-danger hover:bg-danger/10"
        aria-label={label}
      >
        <Trash2 size={16} />
      </button>
    );
  }

  return (
    <form action={action} className="flex shrink-0 items-center gap-1">
      <button
        type="submit"
        className="h-10 rounded-lg bg-danger px-3 text-sm font-semibold text-white hover:opacity-90"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={() => setConfirmando(false)}
        className="h-10 rounded-lg px-3 text-sm font-medium text-muted hover:bg-field"
      >
        Cancelar
      </button>
    </form>
  );
}
