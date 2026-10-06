import type { NextConfig } from "next";

/**
 * GitHub Pages liefert das Projekt unter https://nilsreining.github.io/masterarbeit-checkout-study/ aus.
 * Der Unterpfad (basePath) wird nur beim GitHub-Pages-Build gesetzt (`npm run build:pages`,
 * d. h. GITHUB_PAGES=true). Lokal (`npm run dev`, `npm run build`) läuft alles unter „/“.
 */
const GITHUB_PAGES_BASE_PATH = "/masterarbeit-checkout-study";
const basePath = process.env.GITHUB_PAGES === "true" ? GITHUB_PAGES_BASE_PATH : "";

const nextConfig: NextConfig = {
  // Keine automatisch erzeugten AGENTS.md/CLAUDE.md im Repository.
  agentRules: false,
  // Statischer Export nach out/ (kein Node-Server nötig, z. B. für GitHub Pages).
  output: "export",
  basePath,
  // Jede Seite als <pfad>/index.html – wird von GitHub Pages zuverlässig ausgeliefert.
  trailingSlash: true,
  // Image Optimization benötigt einen Server; die Produktbilder sind ohnehin SVGs.
  images: { unoptimized: true },
  // next/link und der Router ergänzen basePath automatisch, Bildpfade nicht.
  // Daher wird der Wert dem Browser-Code bereitgestellt (siehe src/lib/basePath.ts).
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};

export default nextConfig;
