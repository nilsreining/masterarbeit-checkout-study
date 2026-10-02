import { type CartLine, countLineItems, subtotalCents } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { SHIPPING_COST_CENTS } from "@/lib/studyConfig";
import { CartItemList } from "./CartItemList";

/**
 * Kompakte Bestellübersicht „Ihre Bestellung“ (Desktop: rechte, mitlaufende Spalte).
 * Versandkosten sind für beide Lieferoptionen gleich und hängen nicht von der Auswahl ab.
 */
export function OrderSummary({ lines, children }: { lines: CartLine[]; children?: React.ReactNode }) {
  const subtotal = subtotalCents(lines);
  const itemCount = countLineItems(lines);

  return (
    <section aria-labelledby="order-summary-heading" className="rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
      <h2 id="order-summary-heading" className="text-base font-semibold text-neutral-900">
        Ihre Bestellung
      </h2>

      <div className="mt-4">
        <CartItemList lines={lines} compact />
      </div>

      <dl className="mt-4 space-y-2 border-t border-neutral-200 pt-4 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-700">Zwischensumme ({itemCount} Artikel)</dt>
          <dd className="text-neutral-900">{formatPrice(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-neutral-700">Versand</dt>
          <dd className="text-neutral-900">
            {SHIPPING_COST_CENTS === 0 ? "Kostenlos" : formatPrice(SHIPPING_COST_CENTS)}
          </dd>
        </div>
        <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
          <dt className="font-semibold text-neutral-900">Gesamt</dt>
          <dd className="font-semibold text-neutral-900">{formatPrice(subtotal + SHIPPING_COST_CENTS)}</dd>
        </div>
      </dl>
      <p className="mt-1 text-right text-xs text-neutral-500">Alle Preise inkl. MwSt.</p>

      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}
