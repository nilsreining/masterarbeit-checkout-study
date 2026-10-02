"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { type CartLine, resolveCartLines } from "../cart";
import { ROUTES } from "./routes";
import { useStudy } from "./StudyContext";

/** Query-Parameter, mit dem der Warenkorb den Hinweis „Bitte wählen Sie zunächst ein Produkt aus.“ zeigt. */
export const SELECT_PRODUCT_NOTICE = { hinweis: "produkt" } as const;

/** Aufgelöste Warenkorb-Positionen (Produkt, Menge, Positionssumme). */
export function useCartLines(): CartLine[] {
  const { session } = useStudy();
  return useMemo(() => resolveCartLines(session.cart), [session.cart]);
}

/**
 * Wie useCartLines, leitet aber bei leerem Warenkorb (z. B. direkter Aufruf
 * von /study/checkout) zum Warenkorb um, der dann einen neutralen Hinweis zeigt.
 */
export function useCartLinesOrRedirect(): CartLine[] {
  const { href } = useStudy();
  const router = useRouter();
  const lines = useCartLines();
  const isEmpty = lines.length === 0;
  const cartHref = href(ROUTES.cart, SELECT_PRODUCT_NOTICE);

  useEffect(() => {
    if (isEmpty) router.replace(cartHref);
  }, [isEmpty, router, cartHref]);

  return lines;
}
