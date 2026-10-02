"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useStudy } from "@/lib/study/StudyContext";
import { ROUTES } from "@/lib/study/routes";
import { StudyPage } from "./StudyPage";

/** Neutrale Übergangsseite – keine Hinweise auf Forschungsziel, Bedingungen oder Hinweistexte. */
export function StudyIntro() {
  const { href, startStudy } = useStudy();
  const router = useRouter();

  function handleStart() {
    startStudy();
    router.push(href(ROUTES.shop));
  }

  return (
    <StudyPage>
      <h1 className="text-2xl font-semibold text-neutral-900">Teil 2 der Studie</h1>
      <div className="mt-5 space-y-4 text-base leading-relaxed text-neutral-700">
        <p>Vielen Dank, dass Sie am zweiten Teil der Studie teilnehmen.</p>
        <p>
          Im folgenden Abschnitt sehen Sie einen simulierten Online-Shop. Stellen Sie sich bitte vor, Sie
          möchten heute Produkte aus diesem Online-Shop bestellen. Schauen Sie sich die angebotenen Produkte
          an und legen Sie diejenigen in den Warenkorb, die Sie unter normalen Umständen am ehesten kaufen
          würden.
        </p>
        <p>
          Bitte treffen Sie Ihre Entscheidungen so, wie Sie es auch bei einem tatsächlichen Online-Einkauf
          tun würden.
        </p>
      </div>
      <p className="mt-6 text-sm leading-relaxed text-neutral-500">
        Es handelt sich um eine Simulation. Es wird keine tatsächliche Bestellung durchgeführt und es
        entstehen keine Kosten.
      </p>
      <Button className="mt-8 w-full sm:w-auto" onClick={handleStart}>
        Zum Online-Shop
      </Button>
    </StudyPage>
  );
}
