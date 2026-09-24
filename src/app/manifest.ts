import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Citadino — Campeonatos de futsal ao vivo",
    short_name: "Citadino",
    description:
      "Feed de partidas ao vivo, resultados, classificação e artilharia do seu campeonato.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#f5821f",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
