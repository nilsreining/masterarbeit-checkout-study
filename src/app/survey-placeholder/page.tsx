import { StudyPage } from "@/components/study/StudyPage";
import { POST_SURVEY_TOKEN_PARAM } from "@/lib/studyConfig";

/**
 * Lokaler Platzhalter für Google Form 2 (abschließende Befragung).
 * Wird verwendet, solange NEXT_PUBLIC_POST_SURVEY_URL nicht gesetzt ist.
 */
export default async function SurveyPlaceholderPage({ searchParams }: PageProps<"/survey-placeholder">) {
  const value = (await searchParams)[POST_SURVEY_TOKEN_PARAM];
  const token = Array.isArray(value) ? value[0] : value;

  return (
    <StudyPage>
      <h1 className="text-xl font-semibold text-neutral-900">Abschließende Befragung</h1>
      <p className="mt-4 text-base leading-relaxed text-neutral-700">
        An dieser Stelle wird später die abschließende Befragung geöffnet.
      </p>
      {token && (
        <p className="mt-4 text-sm text-neutral-500">
          Übergebene Teilnehmerkennung: <code className="font-mono">{token}</code>
        </p>
      )}
    </StudyPage>
  );
}
