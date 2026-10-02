const priceFormatter = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

/** 2499 → „24,99 €“ */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

/** 4.5 → „4,5“ */
export function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}

/** 1234 → „1.234“ */
export function formatCount(count: number): string {
  return count.toLocaleString("de-DE");
}
