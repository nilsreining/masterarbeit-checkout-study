/**
 * StudyEventService – Erfassung von Interaktions-Events und der finalen Lieferentscheidung.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION POINT B – Übertragung an die Google Apps Script Web-App      │
 * │                                                                          │
 * │ track():          bleibt lokal (localStorage, Konsole in Development).   │
 * │ submitDecision(): POST an STUDY_API_URL (zentral ins Google Sheet).      │
 * │                   Zusätzlich lokale Kopie als Browser-Sicherung.         │
 * │                                                                          │
 * │ Bei NEXT_PUBLIC_PARTICIPANT_SOURCE=mock wird auch die Entscheidung nur   │
 * │ lokal gespeichert (Offline-Demo).                                        │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Vertrag:
 * - track() ist „fire and forget“: Fehler dürfen den Ablauf nie blockieren.
 * - submitDecision() wird abgewartet und liefert
 *     { status: "saved" }             → Entscheidung gespeichert
 *     { status: "already_completed" } → Server kennt bereits eine Entscheidung (Sperre)
 *   Bei Netzwerkfehler, Timeout oder abgelehnter Speicherung wird das Promise
 *   rejected: Die UI zeigt eine neutrale Fehlermeldung, die Studie gilt NICHT
 *   als abgeschlossen und kann erneut bestätigt werden.
 */
import { IS_DEVELOPMENT, PARTICIPANT_SOURCE, STUDY_API_TIMEOUT_MS, STUDY_API_URL } from "../studyConfig";
import type { DeliveryDecision, StudyEvent, SubmitDecisionResult } from "../types";
import { readJson, storageKeys, writeJson } from "./browserStorage";

export interface StudyEventService {
  track(event: StudyEvent): Promise<void>;
  submitDecision(decision: DeliveryDecision): Promise<SubmitDecisionResult>;
}

function trackLocally(event: StudyEvent): Promise<void> {
  const key = storageKeys.events(event.participantToken);
  const events = readJson<StudyEvent[]>(key) ?? [];
  events.push(event);
  writeJson(key, events);
  if (IS_DEVELOPMENT) {
    console.debug(`[study event] ${event.eventType}`, event);
  }
  return Promise.resolve();
}

/** Lokale Kopie der Entscheidung (Browser-Sicherung und Debugging über /dev). */
function storeDecisionLocally(decision: DeliveryDecision): void {
  writeJson(storageKeys.decision(decision.participantToken), decision);
  if (IS_DEVELOPMENT) {
    console.info("[study decision]", decision);
  }
}

/**
 * Request-Body für die Apps Script Web-App (snake_case wie die GET-Antwort).
 * condition und nudge_text werden bewusst NICHT gesendet: Das Script liest sie
 * serverseitig anhand des Tokens aus dem Tabellenblatt „Participants“.
 */
export function toAppsScriptPayload(decision: DeliveryDecision) {
  return {
    token: decision.participantToken,
    items: decision.cartItems.map((item) => ({
      product_id: item.productId,
      quantity: item.quantity,
      unit_price: item.unitPrice,
      line_total: item.lineTotal,
    })),
    total: decision.cartTotal,
    delivery_choice: decision.deliveryChoice,
    decision_time_seconds: decision.decisionTimeSeconds,
    // Zusätzliche Kennzahlen – kann das Script übernehmen oder ignorieren.
    number_of_different_products: decision.numberOfDifferentProducts,
    total_quantity: decision.totalQuantity,
    default_delivery: decision.defaultDelivery,
    switched_from_default: decision.switchedFromDefault,
    decision_timestamp: decision.decisionTimestamp,
    first_checkout_opened_at: decision.firstCheckoutOpenedAt,
    standard_delivery_date: decision.standardDeliveryDate,
    bundled_delivery_date: decision.bundledDeliveryDate,
  };
}

async function submitDecisionToAppsScript(decision: DeliveryDecision): Promise<SubmitDecisionResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STUDY_API_TIMEOUT_MS);
  let data: { ok?: unknown; error?: unknown };
  try {
    // text/plain ist ein „einfacher“ Content-Type → kein CORS-Preflight (den Apps Script
    // nicht unterstützt). Die Antwort trägt Access-Control-Allow-Origin: *, daher ist
    // KEIN mode: "no-cors" nötig und die JSON-Antwort kann ausgewertet werden.
    const response = await fetch(STUDY_API_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(toAppsScriptPayload(decision)),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } finally {
    clearTimeout(timeout);
  }

  if (data.ok === true) {
    storeDecisionLocally(decision);
    return { status: "saved" };
  }
  if (data.error === "already_completed") {
    return { status: "already_completed" };
  }
  // z. B. unknown_token oder ein Speicherfehler im Script: nicht als gespeichert behandeln.
  throw new Error(`Entscheidung nicht gespeichert: ${String(data.error ?? "unbekannte Antwort")}`);
}

const appsScriptStudyEventService: StudyEventService = {
  track: trackLocally,
  submitDecision: submitDecisionToAppsScript,
};

/** Offline-Demo: alles nur lokal. */
const mockStudyEventService: StudyEventService = {
  track: trackLocally,
  async submitDecision(decision) {
    storeDecisionLocally(decision);
    return { status: "saved" };
  },
};

export const studyEventService: StudyEventService =
  PARTICIPANT_SOURCE === "mock" ? mockStudyEventService : appsScriptStudyEventService;

/** Liest lokal gespeicherte Events (nur für Debugging in Development). */
export function readMockEvents(token: string): StudyEvent[] {
  return readJson<StudyEvent[]>(storageKeys.events(token)) ?? [];
}

export function readMockDecision(token: string): DeliveryDecision | null {
  return readJson<DeliveryDecision>(storageKeys.decision(token));
}
