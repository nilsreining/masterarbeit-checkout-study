import type { ProductId } from "../types";

/** Alle Studienseiten. Der Token wird als ?token=… an jede Route angehängt (siehe useStudy().href). */
export const ROUTES = {
  intro: "/study",
  shop: "/study/shop",
  product: (id: ProductId) => `/study/product/${id}`,
  cart: "/study/cart",
  checkout: "/study/checkout",
  review: "/study/review",
  complete: "/study/complete",
} as const;

export function withToken(path: string, token: string, extra?: Record<string, string>): string {
  const params = new URLSearchParams({ token, ...extra });
  return `${path}?${params.toString()}`;
}
