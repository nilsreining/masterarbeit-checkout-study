"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, TextLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/services/dateService";
import { useRunOnce, useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import { countLineItems, subtotalCents } from "@/lib/cart";
import { useCartLinesOrRedirect } from "@/lib/study/useCartLines";
import { DELIVERY_OPTION_LABELS, SHIPPING_COST_CENTS } from "@/lib/studyConfig";
import { CheckoutSteps } from "./CheckoutSteps";
import { CartItemList } from "./CartItemList";

/** Bestellübersicht – der Hinweistext wird hier bewusst NICHT erneut gezeigt. */
export function OrderReview() {
  const { href, session, track, confirmDecision } = useStudy();
  const router = useRouter();
  const lines = useCartLinesOrRedirect();
  const hasProducts = lines.length > 0;
  const dates = session.deliveryDates;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Ohne festgelegte Liefertermine (direkter Aufruf) zurück zur Lieferauswahl.
  const checkoutHref = href(ROUTES.checkout);
  useEffect(() => {
    if (hasProducts && !dates) router.replace(checkoutHref);
  }, [hasProducts, dates, router, checkoutHref]);

  useRunOnce(Boolean(hasProducts && dates), () => track("order_reviewed"));

  if (!hasProducts || !dates) return null;

  const deliveryDate = session.deliveryChoice === "bundled" ? dates.bundled : dates.standard;
  const subtotal = subtotalCents(lines);
  const itemCount = countLineItems(lines);
  const total = subtotal + SHIPPING_COST_CENTS;

  async function handleConfirm() {
    setIsSubmitting(true);
    setHasError(false);
    try {
      // Nach Erfolg leitet der StudyProvider automatisch zur Abschlussseite weiter.
      await confirmDecision();
    } catch {
      setHasError(true);
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <CheckoutSteps current="Überprüfen" />
      <h1 className="text-2xl font-semibold text-neutral-900">Bestellung überprüfen</h1>

      <section aria-labelledby="review-product" className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
        <h2 id="review-product" className="mb-4 text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {lines.length === 1 ? "Produkt" : "Produkte"}
        </h2>
        <CartItemList lines={lines} />
      </section>

      <section aria-labelledby="review-delivery" className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 id="review-delivery" className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
            Lieferung
          </h2>
          <TextLink href={checkoutHref}>Lieferoption ändern</TextLink>
        </div>
        <p className="mt-3 font-medium text-neutral-900">{DELIVERY_OPTION_LABELS[session.deliveryChoice]}</p>
        <p className="mt-1 text-sm text-neutral-700">Lieferdatum: {formatDeliveryDate(deliveryDate)}</p>
      </section>

      <section aria-label="Kosten" className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6">
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-neutral-700">Zwischensumme ({itemCount} Artikel)</dt>
            <dd className="text-neutral-900">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-neutral-700">Versand</dt>
            <dd className="text-neutral-900">{formatPrice(SHIPPING_COST_CENTS)}</dd>
          </div>
          <div className="flex justify-between border-t border-neutral-200 pt-3 text-base">
            <dt className="font-semibold text-neutral-900">Gesamtbetrag</dt>
            <dd className="font-semibold text-neutral-900">{formatPrice(total)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-right text-xs text-neutral-500">inkl. MwSt.</p>
      </section>

      {hasError && (
        <p role="alert" className="mt-6 rounded-md border border-neutral-300 bg-white p-4 text-sm text-neutral-800">
          Ihre Auswahl konnte leider nicht gespeichert werden. Bitte versuchen Sie es erneut.
        </p>
      )}

      <div className="mt-8 flex flex-col-reverse gap-4 sm:flex-row sm:items-center sm:justify-end">
        <Button onClick={handleConfirm} disabled={isSubmitting}>
          Auswahl bestätigen
        </Button>
      </div>
    </div>
  );
}
