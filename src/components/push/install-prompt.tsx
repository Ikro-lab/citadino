"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

export function InstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Reads window/navigator, only available post-mount; needed to avoid a
    // server/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !(window as unknown as { MSStream?: unknown }).MSStream
    );
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);
  }, []);

  if (isStandalone || !isIOS) return null;

  return (
    <Card>
      <h2 className="mb-1 font-semibold">Instalar na tela inicial</h2>
      <p className="text-sm text-muted">
        Toque no ícone de compartilhar{" "}
        <span role="img" aria-label="compartilhar">
          ⎋
        </span>{" "}
        e depois em &quot;Adicionar à Tela de Início&quot;{" "}
        <span role="img" aria-label="adicionar">
          ➕
        </span>{" "}
        para instalar o Citadino como um app.
      </p>
    </Card>
  );
}
