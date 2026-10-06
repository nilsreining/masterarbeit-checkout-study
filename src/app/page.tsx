"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ROUTES } from "@/lib/study/routes";

/**
 * Die Wurzel-URL leitet im Browser zur Studie weiter. Der komplette Query-String
 * (inkl. ?token=…) bleibt dabei unverändert erhalten.
 * Clientseitig, damit die Seite statisch exportiert werden kann (GitHub Pages).
 */
export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(`${ROUTES.intro}${window.location.search}`);
  }, [router]);

  return <div className="min-h-screen bg-neutral-100" aria-busy="true" />;
}
