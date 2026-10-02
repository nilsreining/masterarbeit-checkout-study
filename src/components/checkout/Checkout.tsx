"use client";

import { useEffect } from "react";
import { ButtonLink, TextLink } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { formatDeliveryDate } from "@/lib/services/dateService";
import { useRunOnce, useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import { useCartLinesOrRedirect } from "@/lib/study/useCartLines";
import { DELIVERY_OPTION_LABELS, SHIPPING_COST_CENTS } from "@/lib/studyConfig";
import { CheckoutSection } from "./CheckoutSection";
import { CheckoutSteps } from "./CheckoutSteps";
import { DeliveryOption } from "./DeliveryOption";
import { OrderSummary } from "./OrderSummary";
import { PaymentMethod } from "./PaymentMethod";
import { ShippingAddress } from "./ShippingAddress";
import { SustainabilityNudge } from "./SustainabilityNudge";

const NUDGE_ID = "bundled-delivery-note";

/**
 * Checkout „Bestellung abschließen“.
 *
 * Aufbau (Desktop zweispaltig, mobil untereinander):
 *   links:  1. Lieferadresse · 2. Lieferoption · 3. Zahlungsart
 *   rechts: „Ihre Bestellung“ (mitlaufend) mit CTA „Bestellung überprüfen“
 *
 * Lieferadresse und Zahlungsart sind fiktiv, vorausgefüllt und reine Anzeige.
 * Studienrelevant ist ausschließlich die Lieferoption:
 * - „Standardlieferung“ ist vorausgewählt (Default aus der Session, initial DEFAULT_DELIVERY)
 * - der Hinweis steht ausschließlich bei „Gebündelte Lieferung“
 * - „Bestellung überprüfen“ ist sofort aktiv
 */
export function Checkout() {
  const { href, participant, session, setDeliveryChoice, ensureDeliveryDates, track } = useStudy();
  const lines = useCartLinesOrRedirect();
  const hasProducts = lines.length > 0;
  const dates = session.deliveryDates;

  useEffect(() => {
    if (hasProducts) ensureDeliveryDates();
  }, [hasProducts, ensureDeliveryDates]);

  useRunOnce(Boolean(hasProducts && dates), () => track("checkout_opened", { includeNudge: true, includeCartSnapshot: true }));

  if (!hasProducts || !dates) return null;

  const priceLabel = SHIPPING_COST_CENTS === 0 ? "Kostenlos" : formatPrice(SHIPPING_COST_CENTS);

  return (
    <div>
      <CheckoutSteps current="Lieferung" />
      <h1 className="text-2xl font-semibold text-neutral-900">Bestellung abschließen</h1>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start lg:gap-8">
        <div className="space-y-4">
          <CheckoutSection
            step={1}
            title="Lieferadresse"
            fixedNotice="Die Lieferadresse ist in dieser Simulation bereits festgelegt."
          >
            <ShippingAddress />
          </CheckoutSection>

          <CheckoutSection step={2} title="Lieferoption">
            <fieldset>
              <legend className="sr-only">Lieferoption wählen</legend>
              <div className="space-y-3">
                <DeliveryOption
                  value="standard"
                  title={DELIVERY_OPTION_LABELS.standard}
                  dateLabel={formatDeliveryDate(dates.standard)}
                  priceLabel={priceLabel}
                  checked={session.deliveryChoice === "standard"}
                  onSelect={setDeliveryChoice}
                />
                <DeliveryOption
                  value="bundled"
                  title={DELIVERY_OPTION_LABELS.bundled}
                  dateLabel={formatDeliveryDate(dates.bundled)}
                  priceLabel={priceLabel}
                  checked={session.deliveryChoice === "bundled"}
                  onSelect={setDeliveryChoice}
                  describedBy={NUDGE_ID}
                >
                  <SustainabilityNudge id={NUDGE_ID} text={participant.nudgeText} />
                </DeliveryOption>
              </div>
            </fieldset>
          </CheckoutSection>

          <CheckoutSection
            step={3}
            title="Zahlungsart"
            fixedNotice="Die Zahlungsart ist in dieser Simulation bereits festgelegt."
          >
            <PaymentMethod />
          </CheckoutSection>
        </div>

        <aside className="lg:sticky lg:top-6">
          <OrderSummary lines={lines}>
            <ButtonLink href={href(ROUTES.review)} className="w-full">
              Bestellung überprüfen
            </ButtonLink>
            <p className="mt-3 text-center">
              <TextLink href={href(ROUTES.cart)}>Zurück zum Warenkorb</TextLink>
            </p>
          </OrderSummary>
        </aside>
      </div>
    </div>
  );
}
