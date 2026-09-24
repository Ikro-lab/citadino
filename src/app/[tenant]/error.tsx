"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-sm flex-col items-center px-4 py-16 text-center">
      <h1 className="mb-2 font-display text-3xl font-bold leading-none">Não foi possível carregar</h1>
      <p className="mb-6 text-sm text-muted">
        Pode ser a conexão. Confira a internet do celular e tente de novo.
      </p>
      <Button onClick={() => unstable_retry()} size="lg" className="w-full">
        Tentar de novo
      </Button>
    </div>
  );
}
