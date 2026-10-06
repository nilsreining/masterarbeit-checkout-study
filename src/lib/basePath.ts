/**
 * Unterpfad der Veröffentlichung (z. B. "/masterarbeit-checkout-study" auf GitHub Pages, lokal "").
 * Wird in next.config.ts gesetzt.
 *
 * Nur für Pfade nötig, die NICHT über next/link oder den Next-Router laufen
 * (z. B. Bild-URLs aus public/ oder window.location.assign mit relativem Pfad).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** "/products/rucksack.svg" → "/masterarbeit-checkout-study/products/rucksack.svg" (nur für absolute Pfade). */
export function withBasePath(path: string): string {
  return path.startsWith("/") && !path.startsWith("//") ? `${BASE_PATH}${path}` : path;
}
