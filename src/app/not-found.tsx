import { StudyPage } from "@/components/study/StudyPage";

export default function NotFound() {
  return (
    <StudyPage>
      <h1 className="text-xl font-semibold text-neutral-900">Seite nicht gefunden</h1>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        Die aufgerufene Seite ist leider nicht verfügbar.
      </p>
    </StudyPage>
  );
}
