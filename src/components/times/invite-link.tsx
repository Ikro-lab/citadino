"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Card } from "@/components/ui/card";

export function InviteLink({ conviteToken }: { conviteToken: string }) {
  const [copiado, setCopiado] = useState(false);
  const caminho = `/convite/${conviteToken}`;

  return (
    <Card className="bg-surface">
      <p className="mb-2 text-sm font-semibold">Link de convite para atletas</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={caminho}
          className="h-10 flex-1 rounded-lg border border-border bg-white px-3 text-xs text-muted"
          onFocus={(e) => e.target.select()}
        />
        <button
          type="button"
          onClick={async () => {
            const url = `${window.location.origin}${caminho}`;
            await navigator.clipboard.writeText(url);
            setCopiado(true);
            setTimeout(() => setCopiado(false), 1500);
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-white hover:bg-surface"
          aria-label="Copiar link"
        >
          {copiado ? <Check size={16} className="text-success" /> : <Copy size={16} />}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted">
        Compartilhe por WhatsApp para os atletas se inscreverem sozinhos no time.
      </p>
    </Card>
  );
}
