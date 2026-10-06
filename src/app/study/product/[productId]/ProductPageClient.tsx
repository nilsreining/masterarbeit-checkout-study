"use client";

import { useParams } from "next/navigation";
import { ShopLayout } from "@/components/layout/ShopLayout";
import { ProductDetail } from "@/components/shop/ProductDetail";
import { TextLink } from "@/components/ui/Button";
import { getProductById } from "@/lib/data/products";
import { useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";

/** Produktdetailseite (Browser-Teil). Die Produkt-ID kommt aus der URL. */
export function ProductPageClient() {
  const { productId } = useParams<{ productId: string }>();
  const { href } = useStudy();
  const product = getProductById(productId);

  return (
    <ShopLayout>
      {product ? (
        <ProductDetail key={product.id} product={product} />
      ) : (
        <div className="rounded-lg border border-neutral-200 bg-white p-6">
          <p className="text-neutral-700">Dieses Produkt ist leider nicht verfügbar.</p>
          <TextLink href={href(ROUTES.shop)} className="mt-4 inline-block">
            ← Zurück zur Übersicht
          </TextLink>
        </div>
      )}
    </ShopLayout>
  );
}
