"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import type { Product } from "@/lib/types";
import { ProductImage } from "./ProductImage";
import { StarRating } from "./StarRating";

export function ProductCard({ product }: { product: Product }) {
  const { href } = useStudy();
  const detailHref = href(ROUTES.product(product.id));

  return (
    <article className="flex flex-col rounded-lg border border-neutral-200 bg-white p-4">
      <Link href={detailHref} tabIndex={-1} aria-hidden="true">
        <ProductImage product={product} />
      </Link>
      <h2 className="mt-4 text-base font-semibold text-neutral-900">
        <Link href={detailHref} className="hover:underline">
          {product.name}
        </Link>
      </h2>
      <p className="mt-1 text-sm leading-relaxed text-neutral-600">{product.shortDescription}</p>
      <div className="mt-3">
        <StarRating rating={product.rating} reviewCount={product.reviewCount} />
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <span className="text-lg font-semibold text-neutral-900">{formatPrice(product.priceCents)}</span>
        <Link href={detailHref} className={buttonClasses("secondary", "px-4 py-2")}>
          Produkt ansehen
        </Link>
      </div>
    </article>
  );
}
