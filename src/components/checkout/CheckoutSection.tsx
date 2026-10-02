"use client";

import { useId, useState } from "react";

/**
 * Nummerierter Abschnitt im Checkout (Lieferadresse, Lieferoption, Zahlungsart).
 * Optional mit dezentem „Ändern“-Link: In der Simulation sind diese Angaben fest,
 * ein Klick blendet nur einen kleinen neutralen Hinweis ein (keine Bearbeitung, kein Tracking).
 */
export function CheckoutSection({
  step,
  title,
  fixedNotice,
  children,
}: {
  step: number;
  title: string;
  /** Wenn gesetzt, wird ein „Ändern“-Link angezeigt, der diesen Hinweis einblendet. */
  fixedNotice?: string;
  children: React.ReactNode;
}) {
  const headingId = useId();
  const noticeId = useId();
  const [showNotice, setShowNotice] = useState(false);

  return (
    <section aria-labelledby={headingId} className="rounded-lg border border-neutral-200 bg-white">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-4 py-3 sm:px-6">
        <h2 id={headingId} className="flex items-center gap-3 text-base font-semibold text-neutral-900">
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-neutral-300 text-xs font-semibold text-neutral-600"
            aria-hidden="true"
          >
            {step}
          </span>
          {title}
        </h2>
        {fixedNotice && (
          <button
            type="button"
            onClick={() => setShowNotice(true)}
            aria-controls={noticeId}
            className="text-sm text-neutral-600 underline-offset-4 hover:text-neutral-900 hover:underline"
          >
            Ändern
          </button>
        )}
      </div>
      <div className="px-4 py-4 sm:px-6 sm:py-5">
        {children}
        {fixedNotice && showNotice && (
          <p id={noticeId} role="status" className="mt-3 text-xs text-neutral-500">
            {fixedNotice}
          </p>
        )}
      </div>
    </section>
  );
}
