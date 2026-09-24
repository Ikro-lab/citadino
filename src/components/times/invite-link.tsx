"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { paths } from "@/lib/tenant-path";

export function InviteLink({ conviteToken, tenantSlug }: { conviteToken: string; tenantSlug: string }) {
  const [copiado, setCopiado] = useState(false);
  const caminho = paths.convite(tenantSlug, conviteToken);

  return (
    <Card className="bg-surface">
      <p className="mb-2 text-sm font-semibold">Link de convite para atletas</p>
      <div className="flex items-center gap-2">
        <input
          readOnly
          value={caminho}
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-base text-muted md:text-xs"
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
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-border/60"
          aria-label="Copiar link"
        >
          {copiado ? <Check size={16} className="text-success" /> : <Copy size={16} />}
        </button>
      </div>
      <button
        type="button"
        onClick={() => {
          const url = `${window.location.origin}${caminho}`;
          const texto = `Faça sua inscrição no time pelo link: ${url}`;
          window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
        }}
        className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#25d366] text-sm font-semibold text-[#0b2e17] hover:opacity-90"
      >
        <MessageCircle size={18} />
        Enviar no WhatsApp
      </button>
      <p className="mt-2 text-xs text-muted">
        Os atletas se inscrevem sozinhos pelo link, e você aprova aqui.
      </p>
    </Card>
  );
}
