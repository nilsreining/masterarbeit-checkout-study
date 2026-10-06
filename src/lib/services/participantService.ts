/**
 * ParticipantService – einzige Stelle, über die die Anwendung Teilnehmerdaten erhält.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ INTEGRATION POINT A – Teilnehmerdaten aus der Google Apps Script Web-App │
 * │                                                                          │
 * │ GET <STUDY_API_URL>?token=<TOKEN> liefert z. B.                          │
 * │   { "ok": true, "participant_token": "PTEST002",                         │
 * │     "condition": "personalized", "nudge_text": "…", "completed": false } │
 * │ bzw. { "ok": false, "error": "unknown_token" }.                          │
 * │                                                                          │
 * │ Abbildung auf ParticipantLookupResult:                                   │
 * │   ok: true + gültige Felder → { status: "found", participant }           │
 * │   ok: false                 → { status: "not_found" } (Link ungültig)    │
 * │   Netzwerkfehler, Timeout, unerwartetes Format → { status: "error" }     │
 * │                                                                          │
 * │ Die Mock-Daten (mock/mockParticipants.ts) werden nur noch verwendet,     │
 * │ wenn NEXT_PUBLIC_PARTICIPANT_SOURCE=mock gesetzt ist.                     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
import { PARTICIPANT_SOURCE, STUDY_API_TIMEOUT_MS, STUDY_API_URL } from "../studyConfig";
import type { Condition, Participant, ParticipantLookupResult } from "../types";
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

/** Antwortformat der Apps-Script-Web-App (snake_case). */
interface AppsScriptParticipantResponse {
  ok?: unknown;
  participant_token?: unknown;
  condition?: unknown;
  nudge_text?: unknown;
  completed?: unknown;
  error?: unknown;
}

const CONDITIONS: readonly Condition[] = ["generic", "personalized"];

/** Prüft die API-Antwort und übersetzt sie in das interne Participant-Format. */
export function mapAppsScriptResponse(token: string, data: AppsScriptParticipantResponse): ParticipantLookupResult {
  if (data.ok === false) return { status: "not_found" };
  if (data.ok !== true) return { status: "error" };

  const { participant_token, condition, nudge_text, completed } = data;
  const isValid =
    participant_token === token &&
    CONDITIONS.includes(condition as Condition) &&
    typeof nudge_text === "string" &&
    nudge_text.trim().length > 0;
  if (!isValid) return { status: "error" };

  const participant: Participant = {
    token: participant_token,
    condition: condition as Condition,
    nudgeText: nudge_text.trim(),
    // Nur ein explizites `true` sperrt; fehlt das Feld, gilt der Teilnehmer als nicht abgeschlossen.
    studyCompleted: completed === true,
  };
  return { status: "found", participant };
}

const appsScriptParticipantService: ParticipantService = {
  async getParticipantByToken(token) {
    const url = new URL(STUDY_API_URL);
    url.searchParams.set("token", token);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), STUDY_API_TIMEOUT_MS);
    try {
      // Einfache GET-Anfrage ohne eigene Header: Apps Script erlaubt sie per CORS ohne Preflight.
      const response = await fetch(url, { method: "GET", cache: "no-store", signal: controller.signal });
      if (!response.ok) return { status: "error" };
      const data = (await response.json()) as AppsScriptParticipantResponse;
      return mapAppsScriptResponse(token, data);
    } catch {
      return { status: "error" };
    } finally {
      clearTimeout(timeout);
    }
  },
};

/** Lokale Demo-Daten – nur bei NEXT_PUBLIC_PARTICIPANT_SOURCE=mock. */
const mockParticipantService: ParticipantService = {
  async getParticipantByToken(token) {
    const participant = MOCK_PARTICIPANTS.find((p) => p.token === token);
    // Kopie zurückgeben, damit niemand die Mock-Daten versehentlich mutiert.
    return participant ? { status: "found", participant: { ...participant } } : { status: "not_found" };
  },
};

export const participantService: ParticipantService =
  PARTICIPANT_SOURCE === "mock" ? mockParticipantService : appsScriptParticipantService;

export function getParticipantByToken(token: string): Promise<ParticipantLookupResult> {
  return participantService.getParticipantByToken(token);
}
