"use client";

/**
 * Entwickler-Übersicht unter /dev (nur Development).
 * Zeigt Demo-Links sowie den lokal gespeicherten Zustand und die Mock-Events je Token.
 * Greift bewusst NICHT auf die Mock-Teilnehmerdaten zu, sondern nur auf localStorage.
 */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { readJson, storageKeys } from "@/lib/services/browserStorage";
import { readMockDecision, readMockEvents } from "@/lib/services/studyEventService";
import { resetLocalStudyState } from "@/lib/study/debug";
import { withToken, ROUTES } from "@/lib/study/routes";
import type { DeliveryDecision, StudyEvent, StudySession } from "@/lib/types";

const DEMO_TOKENS = ["PTEST002", "PTEST001", "GENERIC_DEMO", "PERSONALIZED_DEMO", "COMPLETED_DEMO", "INVALID_DEMO"];

interface TokenState {
  token: string;
  session: StudySession | null;
  events: StudyEvent[];
  decision: DeliveryDecision | null;
}

function readAll(): TokenState[] {
  return DEMO_TOKENS.map((token) => ({
    token,
    session: readJson<StudySession>(storageKeys.session(token)),
    events: readMockEvents(token),
    decision: readMockDecision(token),
  }));
}

export function DevOverview() {
  const [states, setStates] = useState<TokenState[] | null>(null);
  const refresh = useCallback(() => setStates(readAll()), []);

  useEffect(() => {
    // localStorage ist erst im Browser verfügbar.
    const id = requestAnimationFrame(refresh);
    return () => cancelAnimationFrame(id);
  }, [refresh]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 font-mono text-sm">
      <h1 className="font-sans text-2xl font-semibold">Developer-Übersicht (nur Development)</h1>
      <p className="mt-2 font-sans text-neutral-600">
        Zusätzlich in der Browser-Konsole auf jeder Studienseite: <code>window.__studyDebug</code>
      </p>
      <button
        type="button"
        onClick={refresh}
        className="mt-4 rounded border border-neutral-300 bg-white px-3 py-1.5 font-sans hover:bg-neutral-100"
      >
        Aktualisieren
      </button>

      {states?.map(({ token, session, events, decision }) => (
        <section key={token} className="mt-8 rounded border border-neutral-300 bg-white p-4">
          <div className="flex flex-wrap items-center gap-4">
            <h2 className="text-base font-semibold">{token}</h2>
            <Link className="text-blue-700 underline" href={withToken(ROUTES.intro, token)}>
              Studienlink öffnen
            </Link>
            <button
              type="button"
              className="text-red-700 underline"
              onClick={() => {
                resetLocalStudyState(token);
                refresh();
              }}
            >
              Lokalen Zustand zurücksetzen
            </button>
          </div>
          <details className="mt-3">
            <summary className="cursor-pointer">Session {session ? "" : "(leer)"}</summary>
            <pre className="mt-2 overflow-x-auto bg-neutral-50 p-2">{JSON.stringify(session, null, 2)}</pre>
          </details>
          <details className="mt-2">
            <summary className="cursor-pointer">Entscheidung {decision ? "" : "(noch keine)"}</summary>
            <pre className="mt-2 overflow-x-auto bg-neutral-50 p-2">{JSON.stringify(decision, null, 2)}</pre>
          </details>
          <details className="mt-2">
            <summary className="cursor-pointer">Events ({events.length})</summary>
            <pre className="mt-2 overflow-x-auto bg-neutral-50 p-2">{JSON.stringify(events, null, 2)}</pre>
          </details>
        </section>
      ))}
    </main>
  );
}
