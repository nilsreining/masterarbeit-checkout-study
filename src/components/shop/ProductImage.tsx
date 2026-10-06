import Image from "next/image";
import { withBasePath } from "@/lib/basePath";
import type { Product } from "@/lib/types";

/**
 * Produktbild für Übersicht, Detailseite, Warenkorb, Checkout und Bestellübersicht.
 * Die Bilder liegen unter public/products/ und sind bewusst einheitlich gestaltet
 * (gleicher Hintergrund, gleiche Perspektive, gedeckte Farben), damit kein Produkt
 * optisch hervorsticht. Zum Austausch gegen Fotos nur Product.imageUrl ändern.
 */
export function ProductImage({ product, className = "" }: { product: Product; className?: string }) {
  return (
    <div className={`relative aspect-square overflow-hidden rounded-md bg-neutral-100 ${className}`}>
      {product.imageUrl && (
        <Image
          // Bildpfade aus public/ brauchen den Unterpfad (z. B. GitHub Pages) explizit.
          src={withBasePath(product.imageUrl)}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
        />
      )}
    </div>
  );
}
