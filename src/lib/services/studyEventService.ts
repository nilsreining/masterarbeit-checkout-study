/**
 * StudyEventService – Erfassung von Interaktions-Events und der finalen Lieferentscheidung.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION POINT B – Übertragung an Backend / Google Sheet               │
 * │                                                                          │
 * │ Aktuell: mockStudyEventService speichert alles in localStorage und loggt │
 * │ im Development-Modus in die Browser-Konsole.                             │
 * │                                                                          │
 * │ Später: eine Implementierung desselben Interfaces, die z. B.             │
 * │   track()          → POST <API>/events                                   │
 * │   submitDecision() → POST <API>/decisions                                │
 * │ aufruft. Ob dahinter eine Datenbank, ein Google Sheet oder beides steht, │
 * │ entscheidet allein das Backend. Google-Credentials gehören NIE in den    │
 * │ Browser, sondern ausschließlich in das Backend.                          │
 * │ Danach nur `studyEventService` unten umstellen.                          │
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Vertrag:
 * - track() ist „fire and forget“: Fehler dürfen den Ablauf nie blockieren.
 * - submitDecision() wird abgewartet. Schlägt es fehl (Promise rejected), zeigt
 *   die UI eine neutrale Fehlermeldung und erlaubt einen erneuten Versuch.
 *   Ein echtes Backend sollte doppelte Entscheidungen pro Token ablehnen bzw.
 *   idempotent behandeln (serverseitige Sperre).
 */
import { IS_DEVELOPMENT } from "../studyConfig";
import type { DeliveryDecision, StudyEvent } from "../types";
import { readJson, storageKeys, writeJson } from "./browserStorage";

export interface StudyEventService {
  track(event: StudyEvent): Promise<void>;
  submitDecision(decision: DeliveryDecision): Promise<void>;
}

const mockStudyEventService: StudyEventService = {
  async track(event) {
    const key = storageKeys.events(event.participantToken);
    const events = readJson<StudyEvent[]>(key) ?? [];
    events.push(event);
    writeJson(key, events);
    if (IS_DEVELOPMENT) {
      console.debug(`[study event] ${event.eventType}`, event);
    }
  },

  async submitDecision(decision) {
    writeJson(storageKeys.decision(decision.participantToken), decision);
    if (IS_DEVELOPMENT) {
      console.info("[study decision]", decision);
    }
  },
};

export const studyEventService: StudyEventService = mockStudyEventService;

/** Liest gespeicherte Mock-Daten (nur für Debugging in Development). */
export function readMockEvents(token: string): StudyEvent[] {
  return readJson<StudyEvent[]>(storageKeys.events(token)) ?? [];
}

export function readMockDecision(token: string): DeliveryDecision | null {
  return readJson<DeliveryDecision>(storageKeys.decision(token));
}
