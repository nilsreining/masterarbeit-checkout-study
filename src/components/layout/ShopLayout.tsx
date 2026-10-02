import { SHOP_NAME } from "@/lib/studyConfig";
import { ShopHeader } from "./ShopHeader";

/** Gemeinsamer Rahmen aller Shop- und Checkout-Seiten. */
export function ShopLayout({
  children,
  variant = "shop",
}: {
  children: React.ReactNode;
  variant?: "shop" | "checkout";
}) {
  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <ShopHeader variant={variant} />
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-10">{children}</main>
      <footer className="border-t border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <span>
            © {new Date().getFullYear()} {SHOP_NAME}
          </span>
          <span>Alle Preise inkl. MwSt.</span>
        </div>
      </footer>
    </div>
  );
}
