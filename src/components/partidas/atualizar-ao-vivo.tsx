"use client";

import { useRouter } from "next/navigation";
import { usePolling } from "@/lib/use-polling";

/** Recarrega os dados da página a cada 30s enquanto há jogo ao vivo. */
export function AtualizarAoVivo({ ativo }: { ativo: boolean }) {
  const router = useRouter();
  usePolling(() => router.refresh(), 30000, ativo);
  return null;
}
