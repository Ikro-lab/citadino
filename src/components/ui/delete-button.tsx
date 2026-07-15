"use client";

import { Trash2 } from "lucide-react";

export function DeleteButton({
  action,
  confirmText = "Remover este item? Esta ação não pode ser desfeita.",
}: {
  action: () => Promise<void>;
  confirmText?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(confirmText)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-danger hover:bg-red-50"
        aria-label="Remover"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
