import { StudyPage } from "./StudyPage";

/** Wird angezeigt, solange der Token geprüft wird. Bewusst leer, um Flackern zu vermeiden. */
export function StudyLoading() {
  return <div className="min-h-screen bg-neutral-100" aria-busy="true" />;
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

/** Teilnehmerdaten konnten nicht geladen werden (z. B. Netzwerkfehler beim späteren Backend). */
export function StudyLoadError() {
  return (
    <StudyPage>
      <h1 className="text-xl font-semibold text-neutral-900">Seite nicht verfügbar</h1>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        Die Seite konnte leider nicht geladen werden. Bitte versuchen Sie es in einigen Minuten erneut.
      </p>
    </StudyPage>
  );
}
