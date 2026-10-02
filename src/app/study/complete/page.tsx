"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StudyCompletion } from "@/components/study/StudyCompletion";
import { useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";

export default function CompletePage() {
  const { participant, session, href } = useStudy();
  const router = useRouter();
  const isCompleted = participant.studyCompleted || session.completed;
  const introHref = href(ROUTES.intro);

  // Noch nicht abgeschlossen → zurück zum Anfang (kein Überspringen der Entscheidung).
  useEffect(() => {
    if (!isCompleted) router.replace(introHref);
  }, [isCompleted, router, introHref]);

  return isCompleted ? <StudyCompletion /> : null;
}
