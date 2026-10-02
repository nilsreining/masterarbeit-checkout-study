/**
 * Berechnung und deutsche Formatierung der Liefertermine.
 *
 * Regeln (für beide Bedingungen identisch):
 * - Standardlieferung: heute (Europe/Berlin) + STANDARD_DELIVERY_OFFSET_DAYS Kalendertage.
 * - Gebündelte Lieferung: exakt BUNDLED_DELIVERY_EXTRA_DAYS Kalendertage nach der Standardlieferung.
 * - Keiner der beiden Termine darf auf einen Sonntag fallen. Fällt die Standardlieferung
 *   auf einen Sonntag oder einen Tag, nach dem die gebündelte Lieferung auf einen Sonntag
 *   fiele, wird die Standardlieferung um einen Tag nach hinten verschoben.
 *   Feiertage werden nicht berücksichtigt.
 *
 * Datumswerte werden als reine Kalendertage (YYYY-MM-DD) behandelt; gerechnet
 * wird in UTC, damit Sommer-/Winterzeit keine Rolle spielt.
 */
import { BUNDLED_DELIVERY_EXTRA_DAYS, STANDARD_DELIVERY_OFFSET_DAYS } from "../studyConfig";
import type { DeliveryDates } from "../types";

const TIME_ZONE = "Europe/Berlin";
const SUNDAY = 0;

/** Heutiger Kalendertag in Europe/Berlin als YYYY-MM-DD. */
export function todayIsoDate(now: Date = new Date()): string {
  // en-CA liefert das Format YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(now);
}

function parseIsoDate(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function addDays(iso: string, days: number): string {
  const date = parseIsoDate(iso);
  date.setUTCDate(date.getUTCDate() + days);
  return toIsoDate(date);
}

function weekday(iso: string): number {
  return parseIsoDate(iso).getUTCDay();
}

export function computeDeliveryDates(now: Date = new Date()): DeliveryDates {
  let standard = addDays(todayIsoDate(now), STANDARD_DELIVERY_OFFSET_DAYS);
  while (weekday(standard) === SUNDAY || weekday(addDays(standard, BUNDLED_DELIVERY_EXTRA_DAYS)) === SUNDAY) {
    standard = addDays(standard, 1);
  }
  return { standard, bundled: addDays(standard, BUNDLED_DELIVERY_EXTRA_DAYS) };
}

const longDateFormatter = new Intl.DateTimeFormat("de-DE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

/** „2026-10-07“ → „Mittwoch, 7. Oktober“ */
export function formatDeliveryDate(iso: string): string {
  return longDateFormatter.format(parseIsoDate(iso));
}
