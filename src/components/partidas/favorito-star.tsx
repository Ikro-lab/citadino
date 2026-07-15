"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";

const STORAGE_KEY = "citadino_favoritos";

function lerFavoritos(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function salvarFavoritos(favoritos: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(favoritos)));
  } catch {
    // localStorage indisponível — favorito não persiste nesta sessão
  }
}

export function FavoritoStar({ partidaId }: { partidaId: string }) {
  const [favorito, setFavorito] = useState(false);

  useEffect(() => {
    // Lê localStorage, só disponível pós-montagem; evita mismatch de hidratação.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorito(lerFavoritos().has(partidaId));
  }, [partidaId]);

  return (
    <button
      type="button"
      aria-label={favorito ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      aria-pressed={favorito}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const favoritos = lerFavoritos();
        if (favoritos.has(partidaId)) favoritos.delete(partidaId);
        else favoritos.add(partidaId);
        salvarFavoritos(favoritos);
        setFavorito(favoritos.has(partidaId));
      }}
      className="flex h-9 w-9 shrink-0 items-center justify-center text-muted hover:text-accent"
    >
      <Star size={18} className={favorito ? "fill-accent text-accent" : ""} />
    </button>
  );
}
