/**
 * Neutraler Rahmen für Studienseiten außerhalb des Shops
 * (Einleitung, Abschluss, Fehlermeldungen). Bewusst ohne Shop-Branding.
 */
export function StudyPage({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex min-h-screen items-start justify-center bg-neutral-100 px-4 py-10 sm:items-center sm:py-16">
      <div className="w-full max-w-xl rounded-lg border border-neutral-200 bg-white p-6 shadow-sm sm:p-10">
        {children}
      </div>
    </main>
  );
}
