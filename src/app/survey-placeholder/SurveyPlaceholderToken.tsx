"use client";

import { useSearchParams } from "next/navigation";
import { POST_SURVEY_TOKEN_PARAM } from "@/lib/studyConfig";

/** Zeigt die übergebene Teilnehmerkennung an (nur lokaler Platzhalter). */
export function SurveyPlaceholderToken() {
  const token = useSearchParams().get(POST_SURVEY_TOKEN_PARAM);
  if (!token) return null;
  return (
    <p className="mt-4 text-sm text-neutral-500">
      Übergebene Teilnehmerkennung: <code className="font-mono">{token}</code>
    </p>
  );
}
