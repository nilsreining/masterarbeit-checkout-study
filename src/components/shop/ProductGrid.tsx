"use client";

import { useSearchParams } from "next/navigation";
import { TextLink } from "@/components/ui/Button";
import { PRODUCTS } from "@/lib/data/products";
import { useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import { ProductCard } from "./ProductCard";

export function ProductGrid() {
  const { href } = useStudy();
  const query = (useSearchParams().get("q") ?? "").trim();
  const needle = query.toLocaleLowerCase("de-DE");
  const products = needle
    ? PRODUCTS.filter((p) => `${p.name} ${p.shortDescription}`.toLocaleLowerCase("de-DE").includes(needle))
    : PRODUCTS;

  return (
    <section aria-labelledby="product-list-heading">
      <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2">
        <h1 id="product-list-heading" className="text-2xl font-semibold text-neutral-900">
          {query ? `Suchergebnisse für „${query}“` : "Alle Produkte"}
        </h1>
        {query && <TextLink href={href(ROUTES.shop)}>Alle Produkte anzeigen</TextLink>}
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="rounded-lg border border-neutral-200 bg-white p-6 text-neutral-700">
          Zu Ihrer Suche wurden keine Produkte gefunden.
        </p>
      )}
    </section>
  );
}
