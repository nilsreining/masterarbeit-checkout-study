"use client";

import { useState } from "react";
import { Button, ButtonLink, TextLink } from "@/components/ui/Button";
import { QuantitySelect } from "@/components/ui/QuantitySelect";
import { getQuantity, MAX_CART_QUANTITY } from "@/lib/cart";
import { formatPrice } from "@/lib/format";
import { type AddToCartResult, useRunOnce, useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { StarRating } from "./StarRating";

export function ProductDetail({ product }: { product: Product }) {
  const { href, session, addToCart, track } = useStudy();
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState<AddToCartResult | null>(null);

  useRunOnce(true, () => track("product_viewed", { details: { viewedProductId: product.id } }));

  const quantityInCart = getQuantity(session.cart, product.id);

  function handleAddToCart() {
    setResult(addToCart(product.id, quantity));
    setQuantity(1);
  }

  return (
    <div>
      <TextLink href={href(ROUTES.shop)}>← Zurück zur Übersicht</TextLink>

      <div className="mt-4 grid gap-6 rounded-lg border border-neutral-200 bg-white p-4 sm:p-6 md:grid-cols-2 md:gap-10">
        <ProductImage product={product} />

        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-neutral-900">{product.name}</h1>
          <div className="mt-2">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          </div>
          <p className="mt-4 text-2xl font-semibold text-neutral-900">{formatPrice(product.priceCents)}</p>
          <p className="text-xs text-neutral-500">inkl. MwSt., kostenloser Versand</p>

          <p className="mt-5 text-base leading-relaxed text-neutral-700">{product.description}</p>

          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-neutral-700">
            {product.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <QuantitySelect id={`qty-detail-${product.id}`} value={quantity} onChange={setQuantity} />
            <Button className="w-full sm:w-auto" onClick={handleAddToCart}>
              In den Warenkorb
            </Button>
          </div>
          {quantityInCart > 0 && !result && (
            <p className="mt-3 text-sm text-neutral-600">Bereits im Warenkorb: {quantityInCart} Stück</p>
          )}

          {result && (
            <div role="status" className="mt-6 rounded-md border border-neutral-300 bg-neutral-50 p-4">
              <p className="font-medium text-neutral-900">
                {result.wasInCart ? "Menge im Warenkorb wurde aktualisiert." : "Produkt wurde zum Warenkorb hinzugefügt."}
              </p>
              <p className="mt-1 text-sm text-neutral-600">
                Im Warenkorb: {result.resultingQuantity} Stück
                {result.limited && ` (Höchstmenge ${MAX_CART_QUANTITY} pro Artikel)`}
              </p>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <ButtonLink href={href(ROUTES.shop)} variant="secondary">
                  Weiter einkaufen
                </ButtonLink>
                <ButtonLink href={href(ROUTES.cart)}>Zum Warenkorb</ButtonLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
