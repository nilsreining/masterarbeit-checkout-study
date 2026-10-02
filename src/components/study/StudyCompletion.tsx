"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useStudy } from "@/lib/study/StudyContext";
import { StudyPage } from "./StudyPage";

/**
 * Abschlussseite von Teil 2.
 * - direkt nach „Auswahl bestätigen“: „Auswahl abgeschlossen“
 * - bei erneutem Aufruf eines abgeschlossenen Tokens: Hinweis auf bereits abgeschlossene Teilnahme
 * In beiden Fällen geht es nur noch zur abschließenden Befragung weiter – eine zweite Entscheidung ist nicht möglich.
 */
export function StudyCompletion() {
  const { completedInThisVisit, openPostSurvey } = useStudy();
  const [isOpening, setIsOpening] = useState(false);

  // Rückkehr per Browser-Zurück (bfcache): Button wieder aktivieren.
  useEffect(() => {
    const reset = () => setIsOpening(false);
    window.addEventListener("pageshow", reset);
    return () => window.removeEventListener("pageshow", reset);
  }, []);

  async function handleContinue() {
    setIsOpening(true);
    await openPostSurvey();
  }

  return (
    <StudyPage>
      {completedInThisVisit ? (
        <>
          <h1 className="text-2xl font-semibold text-neutral-900">Auswahl abgeschlossen</h1>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-neutral-700">
            <p>Vielen Dank. Ihre Entscheidung wurde gespeichert.</p>
            <p>
              Im nächsten Schritt möchten wir Ihnen noch einige kurze Fragen zu Ihren Eindrücken während des
              Einkaufs stellen.
            </p>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-2xl font-semibold text-neutral-900">Teil 2 der Studie</h1>
          <p className="mt-5 text-base leading-relaxed text-neutral-700">
            Sie haben diesen Teil der Studie bereits abgeschlossen.
          </p>
        </>
      )}
      <Button className="mt-8 w-full sm:w-auto" onClick={handleContinue} disabled={isOpening}>
        Weiter zur abschließenden Befragung
      </Button>
    </StudyPage>
  );
}
