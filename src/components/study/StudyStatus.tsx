import { Button } from "@/components/ui/Button";
import { StudyPage } from "./StudyPage";

/**
 * Wird angezeigt, solange der Token geprüft wird. Dezent und für alle Teilnehmenden identisch.
 * `slow`: Laden dauert länger oder ein automatischer erneuter Versuch läuft.
 */
export function StudyLoading({ slow = false }: { slow?: boolean }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4" aria-busy="true">
      <div role="status" className="max-w-sm text-center">
        <span
          aria-hidden="true"
          className="mx-auto block h-5 w-5 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600 motion-reduce:animate-none"
        />
        <p className="mt-4 text-sm text-neutral-700">Ihre Einkaufssituation wird geladen …</p>
        {slow && (
          <p className="mt-2 text-sm text-neutral-500">
            Die Verbindung dauert etwas länger. Ihr bisheriger Fortschritt bleibt erhalten.
          </p>
        )}
      </div>
    </main>
  );
}

/** Unbekannter, fehlender oder formal ungültiger Token. Keine technischen Details. */
export function InvalidLink() {
  return (
    <StudyPage>
      <h1 className="text-xl font-semibold text-neutral-900">Link ungültig</h1>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        Dieser Studienlink ist leider ungültig oder nicht mehr verfügbar.
      </p>
    </StudyPage>
  );
}

/**
 * Teilnehmerdaten konnten auch nach den automatischen Wiederholungen nicht geladen werden.
 * „Erneut versuchen“ lädt nur die Teilnehmerdaten neu; Token und lokaler Fortschritt bleiben unberührt.
 */
export function StudyLoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <StudyPage>
      <h1 className="text-xl font-semibold text-neutral-900">Seite nicht verfügbar</h1>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        Die Seite konnte leider nicht geladen werden. Bitte versuchen Sie es in einigen Minuten erneut.
      </p>
      <Button className="mt-8 w-full sm:w-auto" onClick={onRetry}>
        Erneut versuchen
      </Button>
    </StudyPage>
  );
}
