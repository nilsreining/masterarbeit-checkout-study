/**
 * Warenkorb-Logik als reine Funktionen (ohne React, ohne Speicher).
 *
 * Datenmodell: CartItem[] – jedes Produkt höchstens einmal, Stückzahl in quantity.
 * Alle Beträge werden in Cent (Ganzzahlen) berechnet, damit keine Rundungsfehler
 * entstehen (24,99 € × 2 = 4998 ct = 49,98 €).
 */
import { getProductById, isProductId } from "./data/products";
import { SHIPPING_COST_CENTS } from "./studyConfig";
import type { CartItem, CartSnapshot, Product, ProductId } from "./types";

/** Höchstmenge pro Produkt (entspricht den Optionen der Mengen-Auswahl). */
export const MAX_CART_QUANTITY = 10;
export const QUANTITY_OPTIONS = Array.from({ length: MAX_CART_QUANTITY }, (_, i) => i + 1);

/** Aufgelöste Warenkorb-Position für die Anzeige. */
export interface CartLine {
  product: Product;
  quantity: number;
  /** price × quantity in Cent */
  lineTotalCents: number;
}

export function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) return 1;
  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.trunc(quantity)));
}

export function getQuantity(cart: CartItem[], productId: ProductId): number {
  return cart.find((item) => item.productId === productId)?.quantity ?? 0;
}

/**
 * Fügt `quantity` Stück hinzu. Ist das Produkt schon im Warenkorb, wird die Menge
 * addiert (gedeckelt auf MAX_CART_QUANTITY), sonst eine neue Position angehängt.
 */
export function addToCart(cart: CartItem[], productId: ProductId, quantity: number) {
  const previousQuantity = getQuantity(cart, productId);
  const resultingQuantity = clampQuantity(previousQuantity + clampQuantity(quantity));
  const next =
    previousQuantity > 0
      ? cart.map((item) => (item.productId === productId ? { ...item, quantity: resultingQuantity } : item))
      : [...cart, { productId, quantity: resultingQuantity }];
  return {
    cart: next,
    wasInCart: previousQuantity > 0,
    quantityAdded: resultingQuantity - previousQuantity,
    resultingQuantity,
    /** true, wenn die gewünschte Menge wegen der Höchstmenge nicht vollständig hinzugefügt wurde. */
    limited: previousQuantity + clampQuantity(quantity) > MAX_CART_QUANTITY,
  };
}

export function setQuantity(cart: CartItem[], productId: ProductId, quantity: number): CartItem[] {
  const value = clampQuantity(quantity);
  return cart.map((item) => (item.productId === productId ? { ...item, quantity: value } : item));
}

export function removeFromCart(cart: CartItem[], productId: ProductId): CartItem[] {
  return cart.filter((item) => item.productId !== productId);
}

/** Gesamte Stückzahl (für den Zähler im Header). */
export function countItems(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/** Löst die Positionen in Produkte auf; unbekannte Produkte werden ignoriert. */
export function resolveCartLines(cart: CartItem[]): CartLine[] {
  return cart.flatMap((item) => {
    const product = getProductById(item.productId);
    return product ? [{ product, quantity: item.quantity, lineTotalCents: product.priceCents * item.quantity }] : [];
  });
}

/** Gesamte Stückzahl aufgelöster Positionen. */
export function countLineItems(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0);
}

export function subtotalCents(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.lineTotalCents, 0);
}

/** 4998 → 49.98 */
export function centsToEuro(cents: number): number {
  return Math.round(cents) / 100;
}

/** Auswertungsrelevanter Warenkorbzustand (für checkout_opened, choice_confirmed und die Entscheidung). */
export function createCartSnapshot(cart: CartItem[]): CartSnapshot {
  const lines = resolveCartLines(cart);
  return {
    numberOfDifferentProducts: lines.length,
    totalQuantity: countLineItems(lines),
    cartTotal: centsToEuro(subtotalCents(lines) + SHIPPING_COST_CENTS),
    cartItems: lines.map((line) => ({
      productId: line.product.id,
      quantity: line.quantity,
      unitPrice: centsToEuro(line.product.priceCents),
      lineTotal: centsToEuro(line.lineTotalCents),
    })),
  };
}

/**
 * Bereinigt gespeicherte bzw. migrierte Daten: nur bekannte Produkte, Mengen 1–10,
 * doppelte Einträge zusammengeführt.
 */
export function sanitizeCart(raw: unknown): CartItem[] {
  if (!Array.isArray(raw)) return [];
  let cart: CartItem[] = [];
  for (const entry of raw) {
    const productId = (entry as Partial<CartItem>)?.productId;
    const quantity = Number((entry as Partial<CartItem>)?.quantity);
    if (typeof productId === "string" && isProductId(productId) && quantity >= 1) {
      cart = addToCart(cart, productId, quantity).cart;
    }
  }
  return cart;
}
