/**
 * Zentrale Konfiguration der Studienanwendung.
 *
 * Alle Werte, die zwischen Generic und Personalized IDENTISCH sein müssen
 * (Shopname, Lieferregeln, Versandkosten, Default), sind hier gebündelt.
 */
import type { DeliveryChoice } from "./types";

export const SHOP_NAME = "Nordwaren";

/** Vorausgewählte Lieferoption. Darf sich zwischen den Bedingungen NICHT unterscheiden. */
export const DEFAULT_DELIVERY = "standard" satisfies DeliveryChoice;

/** Anzeigenamen der Lieferoptionen (Checkout und Bestellübersicht). */
export const DELIVERY_OPTION_LABELS: Record<DeliveryChoice, string> = {
  standard: "Standardlieferung",
  bundled: "Gebündelte Lieferung",
};

/** Versandkosten in Cent – für beide Lieferoptionen identisch. */
export const SHIPPING_COST_CENTS = 0;

/** Kalendertage zwischen heute und der Standardlieferung (vor Wochenend-Anpassung, siehe dateService). */
export const STANDARD_DELIVERY_OFFSET_DAYS = 3;

/** Die gebündelte Lieferung erfolgt exakt so viele Tage nach der Standardlieferung. */
export const BUNDLED_DELIVERY_EXTRA_DAYS = 2;

/**
 * Maximallänge des Hinweistexts. Bis zu dieser Länge passt der Text bei allen
 * Bildschirmbreiten ab 320 px in den reservierten Platz (mobil 3, ab 640 px 2 Zeilen),
 * sodass der Platzbedarf in beiden Bedingungen identisch bleibt. Gemessen im Browser.
 */
export const NUDGE_MAX_RECOMMENDED_LENGTH = 100;

/** Name des Query-Parameters, mit dem der Token an die Befragung übergeben wird. */
export const POST_SURVEY_TOKEN_PARAM =
  process.env.NEXT_PUBLIC_POST_SURVEY_TOKEN_PARAM?.trim() || "participant_token";
const TOKEN_PLACEHOLDER = "{token}";

/**
 * INTEGRATION POINT C – URL der abschließenden Befragung (Google Form 2).
 *
 * Konfiguration über Environment Variables (siehe .env.example):
 *
 * - NEXT_PUBLIC_POST_SURVEY_URL leer       → lokale Platzhalterseite /survey-placeholder
 * - URL enthält „{token}“                  → Platzhalter wird ersetzt. Ideal für einen
 *                                            Google-Forms-„vorausgefüllten Link“, z. B.
 *                                            https://docs.google.com/forms/d/e/<ID>/viewform?usp=pp_url&entry.123456={token}
 * - URL ohne „{token}“                     → Token wird als Query-Parameter angehängt
 *                                            (Name über NEXT_PUBLIC_POST_SURVEY_TOKEN_PARAM, Default participant_token)
 */
export function buildPostSurveyUrl(token: string): string {
  const configured = process.env.NEXT_PUBLIC_POST_SURVEY_URL?.trim() || "/survey-placeholder";
  const encodedToken = encodeURIComponent(token);

  if (configured.includes(TOKEN_PLACEHOLDER)) {
    return configured.split(TOKEN_PLACEHOLDER).join(encodedToken);
  }

  const separator = configured.includes("?") ? "&" : "?";
  return `${configured}${separator}${encodeURIComponent(POST_SURVEY_TOKEN_PARAM)}=${encodedToken}`;
}

/** Debug-Hilfen (Konsole, window.__studyDebug, /dev) nur im Development-Modus. */
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
