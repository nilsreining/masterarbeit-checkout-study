"use client";

import { useSearchParams } from "next/navigation";
import { ProductImage } from "@/components/shop/ProductImage";
import { ButtonLink } from "@/components/ui/Button";
import { QuantitySelect } from "@/components/ui/QuantitySelect";
import { type CartLine, countLineItems, subtotalCents } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { useRunOnce, useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import { SELECT_PRODUCT_NOTICE, useCartLines } from "@/lib/study/useCartLines";
import { CheckoutSteps } from "./CheckoutSteps";

/**
 * Warenkorb – bewusst OHNE Lieferoptionen oder sonstige Hinweise.
 * Beliebig viele verschiedene Produkte, Menge je Position 1–10 direkt änderbar.
 * „Weiter zur Kasse“ gibt es nur bei gefülltem Warenkorb.
 */
export function Cart() {
  const { href, track } = useStudy();
  const lines = useCartLines();
  const showSelectNotice = useSearchParams().get("hinweis") === SELECT_PRODUCT_NOTICE.hinweis;
  const itemCount = countLineItems(lines);

  useRunOnce(true, () => track("cart_opened"));

  return (
    <div className="mx-auto max-w-4xl">
      <CheckoutSteps current="Warenkorb" />
      <h1 className="text-2xl font-semibold text-neutral-900">Warenkorb</h1>

      {lines.length > 0 ? (
        <>
          <div className="mt-6 rounded-lg border border-neutral-200 bg-white px-4 sm:px-6">
            <ul className="divide-y divide-neutral-200">
              {lines.map((line) => (
                <CartRow key={line.product.id} line={line} />
              ))}
            </ul>
            <div className="border-t border-neutral-200 py-5 text-right">
              <p className="text-base text-neutral-700">
                Zwischensumme ({itemCount} Artikel):{" "}
                <span className="text-lg font-semibold text-neutral-900">{formatPrice(subtotalCents(lines))}</span>
              </p>
              <p className="mt-1 text-xs text-neutral-500">inkl. MwSt., kostenloser Versand</p>
            </div>
          </div>
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
            <ButtonLink href={href(ROUTES.shop)} variant="secondary">
              Weiter einkaufen
            </ButtonLink>
            <ButtonLink href={href(ROUTES.checkout)}>Weiter zur Kasse</ButtonLink>
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-lg border border-neutral-200 bg-white px-6 py-10 text-center sm:py-14">
          {showSelectNotice && (
            <p
              role="status"
              className="mx-auto mb-6 max-w-sm rounded-md border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-sm text-neutral-700"
            >
              Bitte wählen Sie zunächst ein Produkt aus.
            </p>
          )}
          <EmptyCartIcon />
          <h2 className="mt-4 text-lg font-semibold text-neutral-900">Ihr Warenkorb ist leer.</h2>
          <p className="mt-2 text-sm text-neutral-600">Sie haben aktuell keine Artikel im Warenkorb.</p>
          <ButtonLink href={href(ROUTES.shop)} className="mt-6">
            Produkte ansehen
          </ButtonLink>
        </div>
      )}
    </div>
  );
}

/** Eine bearbeitbare Warenkorb-Position. */
function CartRow({ line }: { line: CartLine }) {
  const { updateQuantity, removeFromCart } = useStudy();
  const { product, quantity, lineTotalCents } = line;

  return (
    <li className="flex gap-4 py-5 sm:gap-6">
      <ProductImage product={product} className="w-20 shrink-0 self-start sm:w-28" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="font-medium text-neutral-900 sm:text-base">{product.name}</p>
            <p className="mt-1 text-sm text-neutral-600">Einzelpreis: {formatPrice(product.priceCents)}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-neutral-500">Zwischensumme</p>
            <p className="font-semibold text-neutral-900">{formatPrice(lineTotalCents)}</p>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
          <QuantitySelect
            id={`qty-${product.id}`}
            value={quantity}
            onChange={(value) => updateQuantity(product.id, value)}
            ariaLabel={`Menge für ${product.name}`}
          />
          <button
            type="button"
            onClick={() => removeFromCart(product.id)}
            className="inline-flex items-center gap-1.5 rounded text-sm font-medium text-neutral-600 underline decoration-neutral-300 underline-offset-4 hover:text-neutral-900 hover:decoration-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            aria-label={`${product.name} aus dem Warenkorb entfernen`}
          >
            <TrashIcon />
            Entfernen
          </button>
        </div>
      </div>
    </li>
  );
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path
        d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmptyCartIcon() {
  return (
    <svg
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      className="mx-auto text-neutral-300"
      aria-hidden="true"
    >
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.76L20.5 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}
