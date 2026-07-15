"use client";

import { useState } from "react";
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
  const [isDark, setIsDark] = useState(
    () =>
      typeof document !== "undefined" &&
      document.documentElement.getAttribute("data-theme") === "dark"
  );

  return (
    <button
      type="button"
      suppressHydrationWarning
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
