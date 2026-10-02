/**
 * DEMO-DATEN – nur für die lokale Entwicklung.
 *
 * Diese Datei darf AUSSCHLIESSLICH von mockParticipantService importiert
 * werden. Der Rest der Anwendung greift nur über participantService zu.
 *
 * Enthält bewusst keine personenbezogenen Daten und keine Rohdaten aus dem
 * ersten Fragebogen – nur das, was der Checkout zur Darstellung braucht.
 */
import type { Participant } from "../../types";

export const MOCK_PARTICIPANTS: readonly Participant[] = [
  {
    token: "GENERIC_DEMO",
    condition: "generic",
    nudgeText: "Gebündelte Zustellung kann helfen, einzelne Lieferfahrten zu reduzieren.",
    studyCompleted: false,
  },
  {
    token: "PERSONALIZED_DEMO",
    condition: "personalized",
    nudgeText: "Mit etwas mehr Lieferzeit können Zustellungen effizienter gebündelt werden.",
    studyCompleted: false,
  },
  {
    // Simuliert einen Teilnehmer, den das Backend bereits als abgeschlossen führt.
    token: "COMPLETED_DEMO",
    condition: "generic",
    nudgeText: "Gebündelte Zustellung kann helfen, einzelne Lieferfahrten zu reduzieren.",
    studyCompleted: true,
  },
];
