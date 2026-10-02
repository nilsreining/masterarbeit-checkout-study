import type { Metadata, Viewport } from "next";
import { SHOP_NAME } from "@/lib/studyConfig";
import "./globals.css";

export const metadata: Metadata = {
  title: SHOP_NAME,
  // Studienseiten sollen nicht in Suchmaschinen auftauchen.
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
