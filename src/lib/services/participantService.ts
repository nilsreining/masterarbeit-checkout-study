/**
 * ParticipantService – einzige Stelle, über die die Anwendung Teilnehmerdaten erhält.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION POINT A – Token-/Teilnehmer-Datenbank                         │
 * │                                                                          │
 * │ Aktuell: mockParticipantService (statische Demo-Daten).                  │
 * │ Später: eine Implementierung, die z. B. GET <API>/participants/<token>   │
 * │ aufruft und das Ergebnis auf ParticipantLookupResult abbildet:           │
 * │   200 → { status: "found", participant }                                │
 * │   404 → { status: "not_found" }                                          │
 * │   sonst / Netzwerkfehler → { status: "error" }                           │
 * │ Danach nur noch `participantService` unten auf die neue Implementierung   │
 * │ umstellen. Keine andere Datei muss angepasst werden.                     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import type { ParticipantLookupResult } from "../types";
import { MOCK_PARTICIPANTS } from "./mock/mockParticipants";

export interface ParticipantService {
  getParticipantByToken(token: string): Promise<ParticipantLookupResult>;
}

/** Erlaubte Token-Zeichen. Alles andere wird ohne Backend-Anfrage als ungültig behandelt. */
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{4,64}$/;

export function normalizeToken(raw: string | null | undefined): string | null {
  const token = raw?.trim() ?? "";
  return TOKEN_PATTERN.test(token) ? token : null;
}

const mockParticipantService: ParticipantService = {
  async getParticipantByToken(token) {
    const participant = MOCK_PARTICIPANTS.find((p) => p.token === token);
    // Kopie zurückgeben, damit niemand die Mock-Daten versehentlich mutiert.
    return participant ? { status: "found", participant: { ...participant } } : { status: "not_found" };
  },
};

export const participantService: ParticipantService = mockParticipantService;

export function getParticipantByToken(token: string): Promise<ParticipantLookupResult> {
  return participantService.getParticipantByToken(token);
}
