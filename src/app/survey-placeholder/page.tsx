import { Suspense } from "react";
import { StudyPage } from "@/components/study/StudyPage";
import { SurveyPlaceholderToken } from "./SurveyPlaceholderToken";

/**
 * Lokaler Platzhalter für Google Form 2 (abschließende Befragung).
 * Nur für lokale Tests: NEXT_PUBLIC_POST_SURVEY_URL=/survey-placeholder (siehe .env.example).
 * Statisch exportierbar: Die Teilnehmerkennung wird im Browser aus der URL gelesen.
 */
export default function SurveyPlaceholderPage() {
  return (
    <StudyPage>
      <h1 className="text-xl font-semibold text-neutral-900">Abschließende Befragung</h1>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        An dieser Stelle wird später die abschließende Befragung geöffnet.
      </p>
      <Suspense fallback={null}>
        <SurveyPlaceholderToken />
      </Suspense>
    </StudyPage>
  );
}
