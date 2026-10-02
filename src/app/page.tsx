import { redirect } from "next/navigation";

/** Die Wurzel-URL leitet (inkl. eines evtl. vorhandenen Tokens) zur Studie weiter. */
export default async function RootPage({ searchParams }: PageProps<"/">) {
  const { token } = await searchParams;
  const value = Array.isArray(token) ? token[0] : token;
  redirect(value ? `/study?token=${encodeURIComponent(value)}` : "/study");
}
