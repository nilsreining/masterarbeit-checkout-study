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

/**
 * INTEGRATION POINT A/B – Google Apps Script Web-App (Studien-API).
 *
 * - GET  <STUDY_API_URL>?token=<TOKEN>  → Teilnehmerdaten (participantService)
 * - POST <STUDY_API_URL>                → finale Entscheidung (noch nicht angebunden)
 *
 * Die URL ist öffentlich (kein Secret) und kann über NEXT_PUBLIC_STUDY_API_URL
 * überschrieben werden, z. B. für eine Test-Kopie des Scripts.
 */
const DEFAULT_STUDY_API_URL =
  "https://script.google.com/macros/s/AKfycbx58_uhQtgvvAxQCzmhAptGDhvfewEHLTOs11gO9njE9sdskSnRgjrXIgKFlOuQ5XiX/exec";

export const STUDY_API_URL = process.env.NEXT_PUBLIC_STUDY_API_URL?.trim() || DEFAULT_STUDY_API_URL;

/** Apps Script antwortet je nach Auslastung erst nach einigen Sekunden; danach gilt die Anfrage als fehlgeschlagen. */
export const STUDY_API_TIMEOUT_MS = 20_000;

/**
 * Quelle der Teilnehmerdaten: "apps-script" (Standard) oder "mock" (lokale Demo-Tokens
 * GENERIC_DEMO / PERSONALIZED_DEMO / COMPLETED_DEMO, z. B. für Offline-Entwicklung).
 */
export const PARTICIPANT_SOURCE: "apps-script" | "mock" =
  process.env.NEXT_PUBLIC_PARTICIPANT_SOURCE?.trim() === "mock" ? "mock" : "apps-script";

/**
 * INTEGRATION POINT C – Abschließende Befragung (Google Form 2).
 *
 * Der Button „Weiter zur abschließenden Befragung“ erscheint nur auf der Abschlussseite,
 * also erst nachdem die Entscheidung gespeichert wurde (bzw. der Server den Token als
 * abgeschlossen meldet). Die Studien-ID wird über einen vorausgefüllten Link übergeben:
 *
 *   <POST_SURVEY_URL>?usp=pp_url&<POST_SURVEY_TOKEN_PARAM>=<TOKEN>
 *
 * Beide Werte lassen sich über .env.local überschreiben (z. B. für ein Test-Formular).
 */
const DEFAULT_POST_SURVEY_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSftvNZ2O054MHhebfBz_K7V-Z4bLlFNUcioz7DZ5w5JYrTwhQ/viewform";
/** Entry-ID der Frage „Studien-ID“ in Google Form 2. */
const DEFAULT_POST_SURVEY_TOKEN_PARAM = "entry.1548559708";

export const POST_SURVEY_URL = process.env.NEXT_PUBLIC_POST_SURVEY_URL?.trim() || DEFAULT_POST_SURVEY_URL;
export const POST_SURVEY_TOKEN_PARAM =
  process.env.NEXT_PUBLIC_POST_SURVEY_TOKEN_PARAM?.trim() || DEFAULT_POST_SURVEY_TOKEN_PARAM;

/** z. B. PTEST003 → https://docs.google.com/forms/d/e/…/viewform?usp=pp_url&entry.1548559708=PTEST003 */
export function buildPostSurveyUrl(token: string): string {
  // Relative URLs (z. B. /survey-placeholder für lokale Tests) über eine Hilfs-Origin auflösen.
  const isRelative = POST_SURVEY_URL.startsWith("/");
  const url = new URL(POST_SURVEY_URL, "http://relative.invalid");
  // „usp=pp_url“ kennzeichnet bei Google Forms einen vorausgefüllten Link.
  if (url.hostname === "docs.google.com") url.searchParams.set("usp", "pp_url");
  url.searchParams.set(POST_SURVEY_TOKEN_PARAM, token);
  return isRelative ? `${url.pathname}${url.search}` : url.toString();
}

/** Debug-Hilfen (Konsole, window.__studyDebug, /dev) nur im Development-Modus. */
export const IS_DEVELOPMENT = process.env.NODE_ENV === "development";
