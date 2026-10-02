/**
 * Debug-Zugriff für Entwickler – NUR im Development-Modus, nie in der Teilnehmer-UI.
 *
 * In der Browser-Konsole:
 *   __studyDebug.token / .condition / .nudgeText / .session
 *   __studyDebug.events()    → gespeicherte Mock-Events
 *   __studyDebug.decision()  → gespeicherte Mock-Entscheidung
 *   __studyDebug.reset()     → lokalen Zustand dieses Tokens löschen und neu laden
 *
 * Eine Übersicht über alle Demo-Tokens bietet zusätzlich die Seite /dev.
 */
import { removeKey, storageKeys } from "../services/browserStorage";
import { readMockDecision, readMockEvents } from "../services/studyEventService";
import { IS_DEVELOPMENT } from "../studyConfig";
import type { Participant, StudySession } from "../types";

declare global {
  interface Window {
    __studyDebug?: unknown;
  }
}

let lastLoggedToken: string | null = null;

export function resetLocalStudyState(token: string): void {
  removeKey(storageKeys.session(token));
  removeKey(storageKeys.events(token));
  removeKey(storageKeys.decision(token));
}

export function exposeStudyDebug(token: string, participant: Participant, session: StudySession): void {
  if (!IS_DEVELOPMENT) return;

  window.__studyDebug = {
    token,
    condition: participant.condition,
    nudgeText: participant.nudgeText,
    studyCompletedOnServer: participant.studyCompleted,
    session,
    events: () => readMockEvents(token),
    decision: () => readMockDecision(token),
    reset: () => {
      resetLocalStudyState(token);
      window.location.reload();
    },
  };

  if (lastLoggedToken !== token) {
    lastLoggedToken = token;
    console.info(
      `[study] token=${token} condition=${participant.condition} – Details: window.__studyDebug`,
    );
  }
}
