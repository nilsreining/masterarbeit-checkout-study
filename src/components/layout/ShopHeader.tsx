"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { countItems } from "@/lib/cart";
import { useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import { SHOP_NAME } from "@/lib/studyConfig";

/**
 * Kopfzeile des Shops.
 * variant="shop": Logo, Suche, Warenkorb.
 * variant="checkout": reduziert auf Logo und Warenkorb-Link, wie in üblichen Checkouts.
 */
export function ShopHeader({ variant = "shop" }: { variant?: "shop" | "checkout" }) {
  const { href, session } = useStudy();
  const router = useRouter();
  const query = useSearchParams().get("q") ?? "";
  // Gesamte Stückzahl über alle Positionen (z. B. 2 × Trinkflasche + 3 × Powerbank = 5).
  const cartCount = countItems(session.cart);

  function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = String(new FormData(event.currentTarget).get("q") ?? "").trim();
    router.push(href(ROUTES.shop, value ? { q: value } : undefined));
  }

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3 px-4 py-3 sm:flex-nowrap sm:py-4">
        <Link
          href={href(ROUTES.shop)}
          className="order-1 text-xl font-bold tracking-tight text-neutral-900"
          aria-label={`${SHOP_NAME} – Startseite`}
        >
          {SHOP_NAME}
        </Link>

        {variant === "shop" && (
          <form
            role="search"
            onSubmit={handleSearch}
            className="order-3 w-full sm:order-2 sm:max-w-md sm:flex-1"
          >
            <label htmlFor="shop-search" className="sr-only">
              Produkte suchen
            </label>
            <div className="relative">
              <input
                // key: Eingabe bei Navigation mit neuem Suchbegriff zurücksetzen
                key={query}
                id="shop-search"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Produkte suchen"
                className="w-full rounded-md border border-neutral-300 bg-neutral-50 py-2 pl-3 pr-10 text-sm text-neutral-900 placeholder:text-neutral-500 focus:border-neutral-500 focus:bg-white focus:outline-none"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-neutral-500 hover:text-neutral-900"
                aria-label="Suchen"
              >
                <SearchIcon />
              </button>
            </div>
          </form>
        )}

        <Link
          href={href(ROUTES.cart)}
          className="order-2 ml-auto flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-800 hover:bg-neutral-100 sm:order-3"
          aria-label={`Warenkorb, ${cartCount} Artikel`}
        >
          <span className="relative">
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-neutral-900 px-1 text-[10px] font-semibold text-white">
                {cartCount}
              </span>
            )}
          </span>
          <span className="hidden sm:inline">Warenkorb</span>
        </Link>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" strokeLinecap="round" />
    </svg>
  );
}

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M3 4h2l2.4 11.2a1 1 0 0 0 1 .8h9.2a1 1 0 0 0 1-.76L20.5 8H6.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="17" cy="19.5" r="1.3" />
    </svg>
  );
}
