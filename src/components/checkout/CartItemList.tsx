import type { CartLine } from "@/lib/cart";
import { ProductLine } from "./ProductLine";

/** Nur-Lese-Liste aller Warenkorb-Positionen, durch Linien getrennt (Checkout, Bestellübersicht). */
export function CartItemList({ lines, compact = false }: { lines: CartLine[]; compact?: boolean }) {
  return (
    <ul className="divide-y divide-neutral-200">
      {lines.map((line) => (
        <li key={line.product.id} className="py-4 first:pt-0 last:pb-0">
          <ProductLine line={line} compact={compact} />
        </li>
      ))}
    </ul>
  );
}
