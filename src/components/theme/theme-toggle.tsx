"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

function applyTheme(theme: "light" | "dark") {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // localStorage indisponível (modo privado, etc.) — tema não persiste
  }
}

export function ThemeToggle() {
  // Sempre começa false (igual ao servidor, que não sabe o tema real) para
  // não gerar mismatch de hidratação; o valor real é aplicado logo após o
  // mount, quando o ícone ainda não foi pintado pelo usuário.
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  return (
    <button
      type="button"
      aria-label={isDark ? "Ativar tema claro" : "Ativar tema escuro"}
      onClick={() => {
        const next = isDark ? "light" : "dark";
        applyTheme(next);
        setIsDark(!isDark);
      }}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface"
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
