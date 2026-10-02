/**
 * Lokaler Fortschritt pro Token (Reload-Sicherheit in der Demo).
 *
 * Gespeichert werden nur UI-Zustände (Warenkorb, aktuelle Lieferauswahl,
 * Liefertermine, Abschluss-Flag) – keine Teilnehmerdaten.
 * Condition und Hinweistext werden bei jedem Aufruf neu über den
 * participantService geladen und sind dadurch immer identisch.
 *
 * Später: Der Abschlussstatus kommt verbindlich vom Server
 * (Participant.studyCompleted). Der lokale Fortschritt kann bleiben.
 */
import { sanitizeCart } from "../cart";
import { DEFAULT_DELIVERY } from "../studyConfig";
import type { StudySession } from "../types";
import { readJson, storageKeys, writeJson } from "./browserStorage";

export function createSession(token: string): StudySession {
  return {
    version: 2,
    token,
    studyStarted: false,
    cart: [],
    deliveryChoice: DEFAULT_DELIVERY,
    deliveryDates: null,
    completed: false,
  };
}

/** Frühere Speicherformate (Version 1: ein Produkt bzw. eine Liste von Produkt-IDs ohne Menge). */
interface LegacySessionFields {
  version?: number;
  selectedProductId?: unknown;
  selectedProductIds?: unknown;
}

type StoredSession = Omit<Partial<StudySession>, "version"> & LegacySessionFields;

function migrateCart(stored: StoredSession) {
  if (stored.version === 2) return sanitizeCart(stored.cart);
  const legacyIds = Array.isArray(stored.selectedProductIds)
    ? stored.selectedProductIds
    : stored.selectedProductId
      ? [stored.selectedProductId]
      : [];
  return sanitizeCart(legacyIds.map((productId) => ({ productId, quantity: 1 })));
}

export function loadSession(token: string): StudySession {
  const stored = readJson<StoredSession>(storageKeys.session(token));
  if (!stored || (stored.version !== 1 && stored.version !== 2) || stored.token !== token) {
    return createSession(token);
  }
  const base = createSession(token);
  return {
    ...base,
    studyStarted: stored.studyStarted ?? base.studyStarted,
    cart: migrateCart(stored),
    deliveryChoice: stored.deliveryChoice ?? base.deliveryChoice,
    deliveryDates: stored.deliveryDates ?? base.deliveryDates,
    completed: stored.completed ?? base.completed,
  };
}

export function saveSession(session: StudySession): void {
  writeJson(storageKeys.session(session.token), session);
}
