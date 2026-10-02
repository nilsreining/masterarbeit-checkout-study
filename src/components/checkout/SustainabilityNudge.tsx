"use client";

import { useEffect } from "react";
import { IS_DEVELOPMENT, NUDGE_MAX_RECOMMENDED_LENGTH } from "@/lib/studyConfig";

/** Neutrale Label-Zeile über dem Hinweistext (für alle Teilnehmenden identisch). */
const NUDGE_LABEL = "Hinweis zur Lieferung";

/**
 * Hinweis bei der Option „Gebündelte Lieferung“.
 *
 * EXPERIMENTELLE GLEICHHEIT: Diese Komponente erhält ausschließlich den Text.
 * Sie kennt die Bedingung nicht; Box, Label, Icon, Position, Größe, Schrift,
 * Farben, Abstände und Platzbedarf sind für alle Teilnehmenden identisch.
 *
 * Darstellung: dezente Info-Box (hellgrauer Hintergrund, feine Kontur, dunklere
 * Linie links) mit Label „Hinweis zur Lieferung“ und neutralem Info-Icon – deutlich
 * wahrnehmbar, aber ohne Akzentfarbe, Animation oder Werbecharakter.
 *
 * Platzbedarf: Der Textbereich reserviert 5 Zeilen (< 360 px), 3 Zeilen (ab 360 px) bzw. 2 Zeilen (ab 640 px).
 * Texte bis NUDGE_MAX_RECOMMENDED_LENGTH Zeichen passen ab 320 px Breite sicher
 * hinein (im Browser gemessen), die Box ist dadurch in beiden Bedingungen gleich groß.
 * Wird die Grenze erhöht, müssen die min-h-Werte gemeinsam angepasst werden.
 *
 * Rendert nur <span>-Elemente, weil der Hinweis innerhalb des <label> der Option steht.
 */
export function SustainabilityNudge({ text, id }: { text: string; id?: string }) {
  useEffect(() => {
    if (IS_DEVELOPMENT && text.length > NUDGE_MAX_RECOMMENDED_LENGTH) {
      console.warn(
        `[study] Hinweistext hat ${text.length} Zeichen (empfohlen ≤ ${NUDGE_MAX_RECOMMENDED_LENGTH}). ` +
          "Der reservierte Platz könnte überschritten werden.",
      );
    }
  }, [text]);

  return (
    <span
      data-testid="delivery-note"
      className="block rounded-md border border-neutral-200 border-l-[3px] border-l-neutral-500 bg-neutral-100 px-3.5 py-3 sm:px-4"
    >
      <span className="flex items-center gap-2 text-[13px] font-semibold leading-5 text-neutral-800">
        <InfoIcon />
        {NUDGE_LABEL}
      </span>
      <span id={id} className="mt-1.5 block min-h-[110px] text-sm leading-[22px] text-neutral-800 min-[360px]:min-h-[66px] sm:min-h-[44px]">
        {text}
      </span>
    </span>
  );
}

function InfoIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 20 20"
      fill="none"
      className="shrink-0 text-neutral-500"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="8.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="10" cy="6.25" r="1" fill="currentColor" />
    </svg>
  );
}
