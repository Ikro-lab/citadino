import { Trophy } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-lg flex-col items-center justify-center px-4 py-10 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <Trophy size={28} />
      </span>
      <h1 className="mb-2 text-2xl font-bold">Citadino</h1>
      <p className="text-sm text-muted">
        Plataforma de gestão de campeonatos de futsal. Acesse o site do seu campeonato
        pelo link fornecido pelo organizador (ex: <code>citadino.com/seu-campeonato</code>).
      </p>
    </div>
  );
}
