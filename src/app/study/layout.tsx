import { Suspense } from "react";
import { StudyLoading } from "@/components/study/StudyStatus";
import { StudyProvider } from "@/lib/study/StudyContext";

/**
 * Alle Studienseiten teilen sich einen StudyProvider. Er prüft den Token,
 * zeigt bei Bedarf die Fehlerseite und hält den Zustand zwischen den Seiten.
 * Suspense ist nötig, weil der Token aus den Search-Params gelesen wird.
 */
export default function StudyLayout({ children }: LayoutProps<"/study">) {
  return (
    <Suspense fallback={<StudyLoading />}>
      <StudyProvider>{children}</StudyProvider>
    </Suspense>
  );
}
