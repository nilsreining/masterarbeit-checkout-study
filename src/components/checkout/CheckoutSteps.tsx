const STEPS = ["Warenkorb", "Lieferung", "Überprüfen"] as const;

/** Schlichte Fortschrittsanzeige im Checkout. */
export function CheckoutSteps({ current }: { current: (typeof STEPS)[number] }) {
  const currentIndex = STEPS.indexOf(current);
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs text-neutral-500 sm:text-sm" aria-label="Bestellschritte">
      {STEPS.map((step, index) => (
        <li key={step} className="flex items-center gap-2">
          {index > 0 && <span className="h-px w-4 bg-neutral-300 sm:w-8" aria-hidden="true" />}
          <span
            className={index === currentIndex ? "font-semibold text-neutral-900" : undefined}
            aria-current={index === currentIndex ? "step" : undefined}
          >
            {index + 1}. {step}
          </span>
        </li>
      ))}
    </ol>
  );
}
