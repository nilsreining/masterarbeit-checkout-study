import { ProductImage } from "@/components/shop/ProductImage";
import type { CartLine } from "@/lib/cart";
import { formatPrice } from "@/lib/format";

/** Nur-Lese-Darstellung einer Warenkorb-Position (Bild, Name, Menge, Einzel- und Positionspreis). */
export function ProductLine({ line, compact = false }: { line: CartLine; compact?: boolean }) {
  const { product, quantity, lineTotalCents } = line;
  return (
    <div className="flex items-start gap-3 sm:gap-4">
      <ProductImage product={product} className={`shrink-0 ${compact ? "w-16" : "w-20 sm:w-24"}`} />
      <div className="min-w-0 flex-1 text-sm">
        <p className={`font-medium leading-5 text-neutral-900 ${compact ? "" : "sm:text-base"}`}>{product.name}</p>
        <p className="mt-1 text-neutral-600">Menge: {quantity}</p>
        {quantity > 1 && <p className="text-neutral-500">je {formatPrice(product.priceCents)}</p>}
      </div>
      <p className={`shrink-0 font-medium text-neutral-900 ${compact ? "text-sm" : "sm:text-base"}`}>
        {formatPrice(lineTotalCents)}
      </p>
    </div>
  );
}
