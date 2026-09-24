import type { Metadata, Viewport } from "next";
import { Nunito, Barlow_Condensed } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

// Condensada de placar/uniforme: usada no nome do campeonato, títulos e placares.
const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Citadino — Plataforma de Campeonatos",
  description:
    "Acompanhe campeonatos de futsal: feed de partidas ao vivo, resultados e tabela de classificação.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Citadino",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // Permite que o conteúdo use a tela toda no iPhone; as áreas seguras são
  // respeitadas via env(safe-area-inset-*) na barra inferior.
  viewportFit: "cover",
  themeColor: "#f5821f",
};

const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem("theme");if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      data-theme="light"
      suppressHydrationWarning
      className={`${nunito.variable} ${barlowCondensed.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
