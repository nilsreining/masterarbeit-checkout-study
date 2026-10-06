import { PRODUCTS } from "@/lib/data/products";
import { ProductPageClient } from "./ProductPageClient";

/** Statischer Export: Für jedes Produkt wird eine eigene Seite erzeugt. */
export function generateStaticParams() {
  return PRODUCTS.map((product) => ({ productId: product.id }));
}

/** Nur die exportierten Produkt-IDs sind gültig; andere Pfade ergeben die 404-Seite. */
export const dynamicParams = false;

export default function ProductPage() {
  return <ProductPageClient />;
}
