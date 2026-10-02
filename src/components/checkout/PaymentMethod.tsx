import { DISPLAY_PAYMENT_METHOD as payment } from "@/lib/data/checkoutDisplayData";

/** Hinterlegte (fiktive) Zahlungsart und Rechnungsadresse – reine Anzeige, keine Eingabe, keine Zahlung. */
export function PaymentMethod() {
  return (
    <div>
      <div className="flex items-center gap-3">
        <CardIcon />
        <div className="text-sm leading-6">
          <p className="font-medium text-neutral-900">{payment.label}</p>
          <p className="text-neutral-700">
            <span className="tracking-wider">{payment.maskedNumber}</span>
            <span className="block text-neutral-500 sm:ml-3 sm:inline">gültig bis {payment.expiry}</span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2.5 border-t border-neutral-100 pt-4 text-sm text-neutral-700">
        {/* Statische Anzeige eines aktivierten Kontrollkästchens (keine Interaktion vorgesehen). */}
        <span
          role="img"
          aria-label="aktiviert"
          className="flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-neutral-800 text-white"
        >
          <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M2.5 6.2 5 8.5l4.5-5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        Rechnungsadresse entspricht der Lieferadresse
      </div>
    </div>
  );
}

/** Neutrales Karten-Symbol (bewusst ohne Logo eines echten Kartenanbieters). */
function CardIcon() {
  return (
    <span className="flex h-9 w-12 shrink-0 items-center justify-center rounded border border-neutral-300 bg-neutral-50" aria-hidden="true">
      <svg width="26" height="18" viewBox="0 0 26 18" fill="none">
        <rect x="0.75" y="0.75" width="24.5" height="16.5" rx="2.5" stroke="#737373" strokeWidth="1.5" />
        <rect x="1" y="4" width="24" height="3" fill="#a3a3a3" />
        <rect x="4" y="11" width="7" height="2" rx="1" fill="#a3a3a3" />
      </svg>
    </span>
  );
}
