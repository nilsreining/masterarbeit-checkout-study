import { notFound } from "next/navigation";
import { DevOverview } from "@/components/dev/DevOverview";

/** Entwickler-Übersicht (Demo-Links, Mock-Events). In Production nicht erreichbar. */
export default function DevPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <DevOverview />;
}
