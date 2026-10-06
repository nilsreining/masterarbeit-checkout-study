# Checkout-Studie – simulierter Online-Shop (Teil 2)

Web-Anwendung für den experimentellen Teil einer Masterarbeit: ein fiktiver Online-Shop
(„Nordwaren“) mit Checkout, in dem Teilnehmende zwischen **Standardlieferung** (vorausgewählt)
und **gebündelter Lieferung** (+2 Tage) wählen. Bei der gebündelten Lieferung steht ein kurzer
Hinweistext. Dieser Text ist der einzige Unterschied zwischen den Experimentalbedingungen.

**Aktueller Stand:** Frontend und UX, vollständiger Ablauf, Mock-Daten, lokale Speicherung.
Nicht enthalten sind Hosting, Datenbank, Google-Sheets-/Forms-API, KI, E-Mail-Versand,
Zahlungen und personenbezogene Daten. Die Schnittstellen dafür sind vorbereitet
(siehe [Integration Points](#integration-points)).

---

## Schnellstart

Voraussetzung: Node.js ≥ 20.9

```bash
npm install
npm run dev
```

Danach <http://localhost:3000> öffnen. Optional: `cp .env.example .env.local`
(ohne `.env.local` wird eine lokale Platzhalterseite für die Befragung verwendet).

| Befehl              | Zweck                                       |
| ------------------- | ------------------------------------------- |
| `npm run dev`       | Entwicklungsserver                          |
| `npm run build`     | Production-Build                            |
| `npm run start`     | Production-Build lokal starten              |
| `npm run lint`      | ESLint                                      |
| `npm run typecheck` | TypeScript-Prüfung                          |

### Demo-Links

Teilnehmerdaten kommen aus der Google Apps Script Web-App (siehe Integration Point A).
Test-Tokens, die dort hinterlegt sind (Stand 06.10.2026):

| Link                                                    | Verhalten                                         |
| ------------------------------------------------------- | ------------------------------------------------- |
| <http://localhost:3000/study?token=PTEST002>            | Bedingung `personalized`, nicht abgeschlossen     |
| <http://localhost:3000/study?token=PTEST001>            | Bedingung `generic`, laut API bereits abgeschlossen |
| <http://localhost:3000/study?token=INVALID_DEMO>        | unbekannter Token → Fehlerseite                   |
| <http://localhost:3000/dev>                             | Entwickler-Übersicht (nur `npm run dev`)          |

Die lokalen Demo-Tokens `GENERIC_DEMO`, `PERSONALIZED_DEMO` und `COMPLETED_DEMO` funktionieren
nur noch mit `NEXT_PUBLIC_PARTICIPANT_SOURCE=mock` in `.env.local`.

Der Fortschritt wird pro Token im `localStorage` gespeichert. Um einen Demo-Token erneut
durchzuspielen, auf `/dev` „Lokalen Zustand zurücksetzen“ wählen oder in der Browser-Konsole
`__studyDebug.reset()` aufrufen.

---

## Ablauf

```
/study?token=…              Einleitung „Teil 2 der Studie“      → study_started
/study/shop                 Produktübersicht (6 Produkte)
/study/product/[id]         Produktdetail, Menge, „In den Warenkorb“ → product_viewed, product_added
/study/cart                 Warenkorb (ohne Lieferoptionen)     → cart_opened, product_quantity_changed, product_removed
/study/checkout             Lieferoption wählen + Hinweis       → checkout_opened, delivery_option_changed
/study/review               Bestellung überprüfen (ohne Hinweis)→ order_reviewed
      └─ „Auswahl bestätigen“  finale Entscheidung              → choice_confirmed
/study/complete             Abschluss → „Weiter zur abschließenden Befragung“ → post_survey_opened
      └─ Google Form 2 mit vorausgefüllter Studien-ID (Token)
```

Der Token wird an jede Route als `?token=…` angehängt. Die Wurzel-URL `/` leitet auf `/study` weiter.

**Regeln im Ablauf**

- Der Warenkorb verhält sich wie in einem normalen Shop: beliebig viele verschiedene Produkte,
  Menge je Produkt 1–10. Auf der Produktseite wird die gewählte Menge hinzugefügt; liegt das
  Produkt schon im Warenkorb, wird die Menge addiert („Menge im Warenkorb wurde aktualisiert.“).
  Die Höchstmenge von 10 pro Produkt wird dabei nicht überschritten.
- Im Warenkorb lässt sich die Menge je Position per Dropdown ändern und jede Position einzeln
  entfernen. Ist der Warenkorb leer, erscheint „Ihr Warenkorb ist leer.“ mit „Produkte ansehen“,
  und „Weiter zur Kasse“ wird nicht angezeigt.
- Der Zähler im Header zeigt die gesamte Stückzahl (z. B. 2 × Trinkflasche + 3 × Powerbank = 5).
- `/study/checkout` und `/study/review` mit leerem Warenkorb leiten zum Warenkorb um, der dann
  „Bitte wählen Sie zunächst ein Produkt aus.“ zeigt.
- „Lieferoption ändern“ führt zurück zum Checkout. Auswahl, Token, Condition und Hinweis bleiben gleich.
- Nach „Auswahl bestätigen“ ist die Entscheidung final. Jeder spätere Aufruf desselben Tokens
  (egal welche Route) zeigt nur noch „Sie haben diesen Teil der Studie bereits abgeschlossen.“
  und den Button zur Befragung. Eine zweite Entscheidung wird nicht erzeugt.

---

## Projektstruktur

```
src/
├── app/                          Next.js App Router (nur dünne Seiten, Logik liegt in components/lib)
│   ├── layout.tsx                Root-Layout (lang="de", noindex)
│   ├── page.tsx                  / → Weiterleitung auf /study
│   ├── study/
│   │   ├── layout.tsx            StudyProvider für alle Studienseiten
│   │   ├── page.tsx              Einleitung
│   │   ├── shop/ product/[productId]/ cart/ checkout/ review/ complete/
│   ├── survey-placeholder/       lokaler Platzhalter für Google Form 2
│   └── dev/                      Entwickler-Übersicht (in Production 404)
├── components/
│   ├── study/                    StudyIntro, StudyCompletion, StudyStatus (Laden/ungültig/Fehler), StudyPage
│   ├── layout/                   ShopHeader, ShopLayout
│   ├── shop/                     ProductGrid, ProductCard, ProductDetail, ProductImage, StarRating
│   ├── checkout/                 Cart, Checkout, DeliveryOption, SustainabilityNudge, OrderReview,
│   │                             CheckoutSteps, CheckoutSection, ShippingAddress, PaymentMethod,
│   │                             OrderSummary, CartItemList, ProductLine
│   ├── ui/                       Button, ButtonLink, TextLink
│   └── dev/                      DevOverview
└── lib/
    ├── types.ts                  zentrales Datenmodell
    ├── studyConfig.ts            Konstanten (Default, Versand, Liefertage) + Survey-URL-Builder
    ├── format.ts                 Preis-/Zahlenformatierung (de-DE)
    ├── cart.ts                   Warenkorb-Logik als reine Funktionen (Hinzufügen, Menge, Summen, Migration)
    ├── data/products.ts          Produktkatalog (für alle identisch)
    ├── data/checkoutDisplayData.ts  fiktive, vorausgefüllte Lieferadresse und Zahlungsart (nur Anzeige)
    ├── services/
    │   ├── participantService.ts INTEGRATION POINT A
    │   ├── studyEventService.ts  INTEGRATION POINT B
    │   ├── dateService.ts        Liefertermine
    │   ├── sessionStore.ts       lokaler Fortschritt pro Token
    │   ├── browserStorage.ts     fehlertolerante localStorage-Hülle
    │   └── mock/mockParticipants.ts   Demo-Teilnehmer (nur vom participantService importiert)
    └── study/
        ├── StudyContext.tsx      StudyProvider + useStudy() (Zustand, Tracking, Entscheidung)
        ├── routes.ts             Routen + Token-Anhängen
        ├── useCartLines.ts       Warenkorb-Positionen für die UI, Guard für Checkout/Review
        └── debug.ts              window.__studyDebug (nur Development)
```

Stack: Next.js 16 (App Router), React 19, TypeScript (strict), Tailwind CSS 4. Es gibt keine
weiteren Runtime-Dependencies. Die Studienseiten sind Client Components, weil Zustand und
`localStorage` im Browser liegen.

---

## Experimentlogik

- **Keine Randomisierung im Browser.** Die Bedingung wird außerhalb der Anwendung festgelegt
  und kommt zusammen mit dem Hinweistext über den Token.
- Die Anwendung erhält pro Teilnehmer nur `token`, `condition`, `nudgeText` und `studyCompleted`.
- **Einziger systematischer Unterschied: `nudgeText`.** Alles andere ist für beide Bedingungen
  identisch und zentral definiert: Produkte (`lib/data/products.ts`), Preise, Liefertermine
  (`dateService`), Versandkosten, Default und Labels (`studyConfig.ts`), Layout und Buttontexte.
- Die UI kennt die Bedingung nicht. `SustainabilityNudge` bekommt nur einen String.
  `condition` wird ausschließlich intern für Events und die Entscheidung verwendet.
- **Gleiche Darstellung des Hinweises:** gleiche Komponente, gleiche Position (innerhalb der Option
  „Gebündelte Lieferung“), gleiche Box, gleiches Label „Hinweis zur Lieferung“, gleiches Info-Icon,
  gleiche Schrift, Farbe und Abstände. Der Textbereich hat eine feste Mindesthöhe: 5 Zeilen unter
  360 px, 3 Zeilen ab 360 px, 2 Zeilen ab 640 px. Unterschiedlich lange Texte verändern die
  Größe der Box deshalb nicht.
  **Texte dürfen höchstens 100 Zeichen lang sein** (`NUDGE_MAX_RECOMMENDED_LENGTH`). So viel passt
  im Browser gemessen bei jeder Breite ab 320 px. Bei längeren Texten warnt die Konsole im
  Development-Modus. Dann müssen Mindesthöhe und Grenze gemeinsam angepasst werden.
- Geprüft: In beiden Bedingungen sind Position, Größe und berechnete Styles des Hinweises und
  der Lieferoptionen pixelgleich (Desktop 1280 px und mobil 375 px). Nur der Text unterscheidet sich.
- Im UI kommen keine Begriffe wie KI, personalisiert, Experimentalgruppe, Generic/Personalized,
  Nachhaltigkeitslabels oder grüne Umwelt-Elemente vor. Diese Begriffe stehen nur in
  Code-Kommentaren bzw. in den Entwicklerdaten.

### Liefertermine (`lib/services/dateService.ts`)

- Standard: heute (Europe/Berlin) + 3 Kalendertage.
- Gebündelt: **exakt 2 Kalendertage** nach Standard.
- Kein Termin fällt auf einen Sonntag. Fiele einer darauf, wird die Standardlieferung um einen
  Tag verschoben; der Abstand von 2 Tagen bleibt immer erhalten. Feiertage werden nicht berücksichtigt.
- Die Termine werden beim ersten Öffnen des Checkouts berechnet und in der Session gespeichert.
  Checkout, Bestellübersicht und Entscheidung zeigen dadurch immer dieselben Daten, auch nach
  einem Reload oder an einem späteren Tag.
- Format: „Mittwoch, 7. Oktober“ (`Intl.DateTimeFormat("de-DE")`).
- Die Werte lassen sich in `studyConfig.ts` anpassen (`STANDARD_DELIVERY_OFFSET_DAYS`,
  `BUNDLED_DELIVERY_EXTRA_DAYS`).

---

## Tokenlogik

1. Die URL enthält `?token=…`. `StudyProvider` liest den Token und prüft das Format
   (`[A-Za-z0-9_-]{4,64}`). Ungültige Formate werden ohne Lookup abgewiesen.
2. `participantService.getParticipantByToken(token)` liefert `found`, `not_found` oder `error`.
   - `not_found` / fehlender Token: „Dieser Studienlink ist leider ungültig oder nicht mehr verfügbar.“
   - `error`: neutrale Meldung ohne technische Details.
3. Danach wird der lokale Fortschritt dieses Tokens geladen (`sessionStore`).
4. Ist `participant.studyCompleted` (Server) **oder** `session.completed` (lokal) gesetzt,
   wird jede Route auf die Abschlussseite umgeleitet.

**Wichtig für die echte Studie:** Der Token steht sichtbar in der URL. Echte Tokens müssen
deshalb zufällig und neutral sein (z. B. `P7X4K9`) und dürfen keine Rückschlüsse auf die
Bedingung zulassen. Die Demo-Tokens `GENERIC_DEMO` / `PERSONALIZED_DEMO` sind nur zum Testen gedacht.

---

## Datenmodell (`src/lib/types.ts`)

```ts
interface Participant {            // vom participantService geliefert
  token: string;                   // pseudonymer Teilnehmer-Token (= participantId)
  condition: "generic" | "personalized";
  nudgeText: string;               // vorab erzeugter Hinweistext
  studyCompleted: boolean;         // serverseitiger Abschlussstatus
}

interface CartSnapshot {           // Warenkorbzustand für die Auswertung
  numberOfDifferentProducts: number;  // Anzahl unterschiedlicher Produkte
  totalQuantity: number;              // Summe aller Mengen
  cartTotal: number;                  // Gesamtwert in Euro inkl. Versand (kostenlos), z. B. 159.95
  cartItems: { productId; quantity; unitPrice; lineTotal }[];  // Preise in Euro
}

interface DeliveryDecision extends CartSnapshot {   // genau einmal bei „Auswahl bestätigen“
  participantToken: string;
  condition: "generic" | "personalized";
  deliveryChoice: "standard" | "bundled";   // zentrale Studienvariable
  defaultDelivery: "standard";
  switchedFromDefault: boolean;
  displayedNudge: string;
  decisionTimestamp: string;       // ISO-8601, Client-Zeit
  standardDeliveryDate: string;    // YYYY-MM-DD, wie angezeigt
  bundledDeliveryDate: string;     // YYYY-MM-DD, wie angezeigt
}

interface StudyEvent {
  eventId: string;                 // UUID
  eventType: StudyEventType;       // siehe unten
  participantToken: string;
  condition: Condition;
  timestamp: string;               // ISO-8601, Client-Zeit
  cart: { productId; quantity }[];       // Warenkorb nach Ausführung der Aktion
  deliveryChoice: DeliveryChoice | null; // ab Öffnen des Checkouts gesetzt
  displayedNudge: string | null;   // nur bei checkout_opened, delivery_option_changed, choice_confirmed
  details?: Record<string, …>;     // z. B. { from, to }, { viewedProductId } oder { productId }
  // nur bei checkout_opened und choice_confirmed zusätzlich alle CartSnapshot-Felder:
  numberOfDifferentProducts?, totalQuantity?, cartTotal?, cartItems?
}
```

Produkt-Events im Detail:

| Event              | Auslöser                                        | `details`                                         |
| ------------------ | ----------------------------------------------- | ------------------------------------------------- |
| `product_added`            | „In den Warenkorb“ auf der Produktseite | `{ productId, quantityAdded, resultingQuantity }` |
| `product_quantity_changed` | Mengen-Dropdown im Warenkorb            | `{ productId, oldQuantity, newQuantity }`         |
| `product_removed`          | „Entfernen“ im Warenkorb                | `{ productId, removedQuantity }`                  |

### Warenkorb-Datenmodell

```ts
interface CartItem { productId: ProductId; quantity: number }   // quantity 1–10
// Session: cart: CartItem[] – jedes Produkt höchstens einmal, Reihenfolge des ersten Hinzufügens
```

Alle Beträge werden intern in Cent berechnet (`lib/cart.ts`), z. B. 24,99 € × 2 = 4998 ct = 49,98 €.
Ältere lokale Stände (Version 1 mit nur einem Produkt) werden beim Laden automatisch in das
neue Format übernommen (Menge 1).

**Event-Typen:** `study_started`, `product_viewed`, `product_added`, `product_quantity_changed`,
`product_removed`, `cart_opened`,
`checkout_opened`, `delivery_option_changed`, `order_reviewed`, `choice_confirmed`,
`post_survey_opened`.

Das Frontend enthält keine Rohdaten aus dem ersten Fragebogen, keine Scores, Namen,
E-Mail-Adressen oder Telefonnummern. Diese Daten bleiben außerhalb der Anwendung.

### Session und Reload

Pro Token wird unter `checkout-study:v1:session:<token>` gespeichert: Warenkorb,
aktuelle Lieferauswahl, festgelegte Liefertermine und ein Abschluss-Flag. Condition und
Hinweistext werden **nicht** lokal gespeichert, sondern bei jedem Aufruf neu über den
`participantService` geladen. So bleiben sie immer konsistent mit der Quelle. Events und die
Entscheidung liegen im Mock unter `…:events:<token>` bzw. `…:decision:<token>`.

---

## Data to persist in production

Dieser Abschnitt beschreibt, was die echte Persistenzschicht (Datenbank bzw. zentraler
Studiendatensatz, z. B. Google Sheet) übernehmen muss. Alle Felder werden bereits heute vom
Frontend erzeugt und über `studyEventService` übergeben (Integration Point B). Die
Persistenzschicht muss sie nur speichern. Ausnahme sind die als **Backend** markierten Felder.

### 1. Zentraler Studiendatensatz (eine Zeile pro Teilnehmer)

Quelle: `submitDecision(decision: DeliveryDecision)`, genau einmal beim Klick auf „Auswahl bestätigen“.

| Feld                         | Typ                         | Pflicht | Beschreibung                                                                 |
| ---------------------------- | --------------------------- | ------- | ---------------------------------------------------------------------------- |
| `participantToken`           | string                      | ja      | Pseudonymer Schlüssel; verbindet Teil 1, Teil 2 und Google Form 2            |
| `condition`                  | `"generic"`/`"personalized"` | ja     | Experimentalbedingung (Kontrolle; Quelle ist der Teilnehmerdatensatz)        |
| `displayedNudge`             | string                      | ja      | Exakt angezeigter Hinweistext                                                |
| `deliveryChoice`             | `"standard"`/`"bundled"`    | ja      | **Zentrale abhängige Variable**                                              |
| `defaultDelivery`            | `"standard"`                | ja      | Vorausgewählte Option (konstant, zur Dokumentation)                          |
| `switchedFromDefault`        | boolean                     | ja      | `deliveryChoice !== defaultDelivery`                                         |
| `numberOfDifferentProducts`  | integer                     | ja      | Anzahl unterschiedlicher Produkte im Warenkorb                               |
| `totalQuantity`              | integer                     | ja      | Summe aller Mengen                                                           |
| `cartTotal`                  | decimal(10,2)               | ja      | Gesamtwert in Euro inkl. Versand (aktuell 0 €)                               |
| `cartItems`                  | Liste (siehe 2.)            | ja      | Positionen des Warenkorbs                                                    |
| `decisionTimestamp`          | ISO-8601 (UTC)              | ja      | Zeitpunkt des Klicks auf „Auswahl bestätigen“ (Client-Zeit)                  |
| `standardDeliveryDate`       | Datum (YYYY-MM-DD)          | ja      | Angezeigter Termin Standardlieferung                                         |
| `bundledDeliveryDate`        | Datum (YYYY-MM-DD)          | ja      | Angezeigter Termin gebündelte Lieferung (= Standard + 2 Tage)                |
| `serverReceivedAt`           | ISO-8601 (UTC)              | ja      | **Backend:** Eingangszeit auf dem Server (unabhängig von der Client-Uhr)     |
| `studyCompleted`             | boolean                     | ja      | **Backend:** nach erfolgreichem Speichern auf `true` setzen (Sperre)         |

### 2. Warenkorb-Positionen (`cartItems`)

Eine Position pro Produkt. Für eine Datenbank empfiehlt sich eine eigene Tabelle
(Schlüssel `participantToken` + `productId`). In einem Google Sheet geht ein eigenes
Tabellenblatt oder eine JSON-Spalte.

| Feld               | Typ            | Beschreibung                              |
| ------------------ | -------------- | ----------------------------------------- |
| `participantToken` | string         | Fremdschlüssel zum Studiendatensatz       |
| `productId`        | string         | z. B. `powerbank`, `kopfhoerer`           |
| `quantity`         | integer (1–10) | Menge                                     |
| `unitPrice`        | decimal(10,2)  | Einzelpreis in Euro zum Entscheidungszeitpunkt |
| `lineTotal`        | decimal(10,2)  | `unitPrice × quantity`                    |

Geldbeträge als Dezimalzahl mit zwei Nachkommastellen speichern, nicht als Gleitkommazahl.
Das Frontend rechnet intern in Cent.

### 3. Relevante Zeitstempel und Entscheidungszeit

Das Frontend speichert Zeitpunkte, keine fertigen Dauern. Dauern werden in der Auswertung
(oder im Backend) aus dem Event-Log berechnet:

| Kennzahl                  | Berechnung                                                                   |
| ------------------------- | ---------------------------------------------------------------------------- |
| `studyStartedAt`          | `timestamp` des ersten `study_started`                                       |
| `firstCheckoutOpenedAt`   | `timestamp` des ersten `checkout_opened`                                     |
| `decisionTimestamp`       | aus dem Studiendatensatz bzw. `timestamp` von `choice_confirmed`             |
| `decisionTime`            | `decisionTimestamp − firstCheckoutOpenedAt` (Zeit von der Lieferauswahl bis zur Bestätigung) |
| `totalShoppingTime`       | `decisionTimestamp − studyStartedAt`                                         |
| `postSurveyOpenedAt`      | `timestamp` von `post_survey_opened`                                         |

Alle Client-Zeitstempel sind ISO-8601 in UTC. Für robuste Dauern sollte das Backend zusätzlich
je Event einen eigenen Eingangszeitstempel speichern.

### 4. Event-Log (eine Zeile pro Event)

Quelle: `track(event: StudyEvent)`. Erforderlich für Zeitstempel (3.) und den Verlauf, z. B. wie
oft die Lieferoption gewechselt wurde.

| Feld                                                               | Wann gesetzt                                   |
| ------------------------------------------------------------------ | ---------------------------------------------- |
| `eventId`, `eventType`, `participantToken`, `condition`, `timestamp` | immer                                        |
| `cart` (`{ productId, quantity }[]`)                               | immer (Warenkorb nach der Aktion)              |
| `deliveryChoice`                                                   | ab dem ersten Öffnen des Checkouts             |
| `displayedNudge`                                                   | `checkout_opened`, `delivery_option_changed`, `choice_confirmed` |
| `details`                                                          | ereignisspezifisch (siehe Tabelle Produkt-Events, `{ from, to }` bei `delivery_option_changed`) |
| `numberOfDifferentProducts`, `totalQuantity`, `cartTotal`, `cartItems` | `checkout_opened` und `choice_confirmed`   |
| `serverReceivedAt`                                                 | **Backend**                                    |

### 5. Anforderungen an die Persistenzschicht

- **Eine Entscheidung pro Token:** weitere `submitDecision`-Aufrufe für denselben Token ablehnen
  (z. B. HTTP 409) oder idempotent behandeln. Danach liefert der Teilnehmerdatensatz
  `studyCompleted: true`.
- **Events nie verwerfen**, auch nicht nach Abschluss (z. B. `post_survey_opened`).
- **`eventId` ist eindeutig** und eignet sich zur Duplikaterkennung bei erneuten Sendeversuchen.
- **Nicht speichern:** Namen, E-Mail-Adressen, Telefonnummern, IP-Adressen oder Rohdaten aus
  Teil 1. Die Verknüpfung erfolgt ausschließlich über `participantToken`.

---

## Integration Points

Alle Stellen sind im Code mit `INTEGRATION POINT A/B/C` markiert. Es ist bewusst keine
konkrete Infrastruktur vorgegeben.

### A – Teilnehmerdaten (Google Apps Script Web-App) – **angebunden**
**Dateien:** `src/lib/services/participantService.ts`, Konfiguration in `src/lib/studyConfig.ts`

Beim Laden einer Studienseite fragt die App `GET <STUDY_API_URL>?token=<TOKEN>` ab. Der Token
kommt weiterhin aus dem URL-Parameter `?token=`.

| API-Antwort                                                         | Ergebnis in der App                                        |
| ------------------------------------------------------------------- | ---------------------------------------------------------- |
| `{ ok: true, participant_token, condition, nudge_text, completed: false }` | Studie startet; `nudge_text` wird als Hinweis angezeigt |
| `{ ok: true, …, completed: true }`                                  | Abschlussseite „Sie haben diesen Teil der Studie bereits abgeschlossen.“ |
| `{ ok: false, error: "unknown_token" }` (oder anderer Fehler)       | Fehlerseite „Dieser Studienlink ist leider ungültig …“     |
| Netzwerkfehler, Timeout (20 s), unerwartetes Format, abweichender Token | neutrale Fehlerseite „Seite nicht verfügbar“            |

Abbildung: `participant_token → token`, `condition → condition` (nur `generic`/`personalized`),
`nudge_text → nudgeText`, `completed → studyCompleted` (nur explizites `true` sperrt).
Die Anfrage ist ein einfacher GET ohne eigene Header, Apps Script erlaubt ihn per CORS.
Die Antwort dauert typischerweise 2–5 Sekunden; so lange erscheint die bestehende leere Ladeansicht.

Konfiguration (`.env.local`, optional):
- `NEXT_PUBLIC_STUDY_API_URL`: andere Web-App-URL (Standard steht in `studyConfig.ts`).
- `NEXT_PUBLIC_PARTICIPANT_SOURCE=mock`: lokale Demo-Tokens statt API (offline). Danach den Dev-Server neu starten.

### B – Finale Entscheidung → Google Apps Script Web-App – **angebunden**
**Datei:** `src/lib/services/studyEventService.ts` (Aufruf in `StudyContext.tsx → confirmDecision`)

Beim Klick auf „Auswahl bestätigen“ sendet `submitDecision()` einen POST an `STUDY_API_URL`.
Die einzelnen Tracking-Events (`track()`) bleiben lokal im Browser.

- **Kein CORS-Preflight:** `Content-Type: text/plain;charset=utf-8`, keine eigenen Header.
  Apps Script antwortet mit `Access-Control-Allow-Origin: *`, daher ist **kein** `mode: "no-cors"`
  nötig, und die JSON-Antwort wird ausgewertet (im Browser geprüft).
- **Body** (JSON; das Script liest ihn mit `JSON.parse(e.postData.contents)`):

```json
{
  "token": "PTEST002",
  "items": [{ "product_id": "powerbank", "quantity": 2, "unit_price": 29.99, "line_total": 59.98 }],
  "total": 59.98,
  "delivery_choice": "bundled",
  "decision_time_seconds": 14,
  "number_of_different_products": 1,
  "total_quantity": 2,
  "default_delivery": "standard",
  "switched_from_default": true,
  "decision_timestamp": "2026-10-06T10:39:14.085Z",
  "first_checkout_opened_at": "2026-10-06T10:39:00.671Z",
  "standard_delivery_date": "2026-10-10",
  "bundled_delivery_date": "2026-10-12"
}
```

  `condition` und `nudge_text` werden bewusst nicht gesendet; das Script liest sie anhand des
  Tokens aus „Participants“. `decision_time_seconds` = Sekunden vom ersten Öffnen des Checkouts
  bis „Auswahl bestätigen“.
- **Auswertung der Antwort:**

| Antwort                                   | Verhalten der App                                                        |
| ----------------------------------------- | ------------------------------------------------------------------------ |
| `{ "ok": true, … }`                       | Abschlussseite „Auswahl abgeschlossen“; lokale Kopie als Browser-Sicherung |
| `{ "ok": false, "error": "already_completed" }` | Seite „Sie haben diesen Teil der Studie bereits abgeschlossen.“     |
| `{ "ok": false, … }` (z. B. `unknown_token`), HTTP-Fehler, Netzwerkfehler, Timeout (20 s) | Meldung „Ihre Auswahl konnte leider nicht gespeichert werden. Bitte versuchen Sie es erneut.“; **nicht** abgeschlossen, erneuter Versuch möglich |

- **Doppelklick:** Der Button ist während der Anfrage deaktiviert, zusätzlich verhindert
  `confirmDecision()` parallele Aufrufe. Es wird nur ein POST gesendet.
- **Serverseitige Sperre:** Das Script lehnt eine zweite Entscheidung pro Token mit
  `already_completed` ab und liefert beim GET danach `completed: true`.
- Ein POST dauert typischerweise 3–6 Sekunden.
- Bei `NEXT_PUBLIC_PARTICIPANT_SOURCE=mock` wird die Entscheidung nur lokal gespeichert.

### C – Weiterleitung zu Google Form 2 – **angebunden**
**Datei:** `src/lib/studyConfig.ts → buildPostSurveyUrl(token)` (aufgerufen in `StudyContext.tsx → openPostSurvey`)

Der Button „Weiter zur abschließenden Befragung“ erscheint nur auf der Abschlussseite, also erst
nach erfolgreich gespeicherter Entscheidung (oder wenn der Server den Token als abgeschlossen meldet).
Er öffnet einen vorausgefüllten Link, in dem die Studien-ID bereits eingetragen ist:

`https://docs.google.com/forms/d/e/1FAIpQLSftvNZ2O054MHhebfBz_K7V-Z4bLlFNUcioz7DZ5w5JYrTwhQ/viewform?usp=pp_url&entry.1548559708=<TOKEN>`

- Standard-URL und Entry-ID (`entry.1548559708`, Frage „Studien-ID“) stehen in `studyConfig.ts`.
- Überschreibbar über `NEXT_PUBLIC_POST_SURVEY_URL` und `NEXT_PUBLIC_POST_SURVEY_TOKEN_PARAM`;
  für lokale Tests ohne Google z. B. `/survey-placeholder` mit `participant_token`.
- **Formular-Einstellungen:** Das Formular darf keine Google-Anmeldung verlangen. In Google Forms
  unter „Einstellungen → Antworten“ müssen „E-Mail-Adressen erfassen“ auf „Nicht erfassen“
  und „Auf 1 Antwort beschränken“ deaktiviert sein. Außerdem darf der Zugriff nicht auf eine
  Organisation beschränkt sein. Sonst sehen Teilnehmende ohne Login eine Anmeldeseite.

`NEXT_PUBLIC_*`-Variablen werden **beim Build** eingebettet. Nach einer Änderung muss neu gebaut werden.

### D – Environment Variables
Siehe `.env.example`.

| Variable                               | Status        | Zweck                                         |
| -------------------------------------- | ------------- | --------------------------------------------- |
| `NEXT_PUBLIC_POST_SURVEY_URL`          | verwendet     | URL Google Form 2 (C)                         |
| `NEXT_PUBLIC_POST_SURVEY_TOKEN_PARAM`  | verwendet     | Entry-ID / Parametername für den Token (C)    |
| `NEXT_PUBLIC_STUDY_API_BASE_URL`       | Vorschlag     | Basis-URL eines Studien-Backends (A, B)       |
| `DATABASE_URL`, `GOOGLE_*`             | Vorschlag     | nur serverseitig im Backend, nie `NEXT_PUBLIC_` |

---

## Debugging (nur Development)

- **Browser-Konsole:** `window.__studyDebug` enthält `token`, `condition`, `nudgeText` und
  `session` sowie die Funktionen `events()`, `decision()` und `reset()`. Jedes Event wird
  zusätzlich per `console.debug` geloggt.
- **`/dev`:** Demo-Links, gespeicherte Session, Entscheidung und Events je Demo-Token,
  plus Zurücksetzen.
- In Production (`npm run build && npm run start`) sind `/dev` (404) und `__studyDebug` nicht
  vorhanden. In der Teilnehmer-UI gibt es kein Debug-Panel.

---

## Design-Entscheidungen

- **Shopname „Nordwaren“:** fiktiv und neutral, zentral änderbar (`SHOP_NAME`).
- **Farben:** Graustufen mit schwarzen Primär-Buttons und bernsteinfarbenen Bewertungssternen.
  Bewusst kein Grün und keine Umwelt-Symbolik.
- **Produktbilder:** einheitlich gestaltete Vektor-Illustrationen in `public/products/*.svg`
  (gleicher Hintergrund, gleiche Perspektive, gedeckte dunkle Farben), damit kein Produkt
  hervorsticht. Sie werden in Übersicht, Detailseite, Warenkorb, Checkout und Bestellübersicht
  verwendet. Für echte Fotos reicht es, die Datei abzulegen und `imageUrl` in
  `lib/data/products.ts` anzupassen. Fotos sollten ebenfalls einheitlich sein (quadratisch,
  gleicher heller Hintergrund).
- **Produkte:** ähnliche Preise (24,99–49,99 €) und Bewertungen (4,4–4,6), keine Labels oder Empfehlungen.
- **Checkout-Kopfzeile:** reduziert (ohne Suche), wie in üblichen Shops. Dazu eine schlichte
  Schrittanzeige: Warenkorb → Lieferung → Überprüfen.
- **Checkout-Seite:** klassischer zweispaltiger Aufbau. Links stehen nummeriert 1. Lieferadresse,
  2. Lieferoption und 3. Zahlungsart; rechts eine mitlaufende Übersicht „Ihre Bestellung“ mit dem
  Button „Bestellung überprüfen“. Mobil steht alles untereinander, die Bestellübersicht mit Button
  zuletzt. Adresse („Max Mustermann, Musterstraße 18, 10115 Berlin“), Zahlungsart (Kreditkarte
  •••• 4242) und „Rechnungsadresse entspricht der Lieferadresse“ sind fiktiv, vorausgefüllt und
  reine Anzeige: keine Eingabefelder, keine Zahlung, keine Events. Ein Klick auf „Ändern“ blendet
  nur einen kleinen Hinweis ein („… ist in dieser Simulation bereits festgelegt.“). Für alle
  Teilnehmenden ist das identisch (`lib/data/checkoutDisplayData.ts`).
- **Lieferoption:** Die gesamte Karte ist anklickbar, auch der Hinweistext. „Kostenlos“ steht rechts
  neben dem Namen, darunter das Lieferdatum.
- **Hinweis:** eigene dezente Info-Box innerhalb der Option „Gebündelte Lieferung“: hellgrauer
  Hintergrund, feine Kontur, dunklere Linie links, kleines neutrales Info-Icon, Label „Hinweis zur
  Lieferung“ und Text in 14 px mit dunklem Grau. Damit wird er mit hoher Wahrscheinlichkeit
  wahrgenommen, bleibt aber ohne Akzentfarbe, Animation oder Werbecharakter. Mobil nutzt die Box
  die volle Kartenbreite. Sie ist immer sichtbar, unabhängig von der gewählten Option.
- **Bestätigung „In den Warenkorb“:** Inline-Box mit „Weiter einkaufen“ / „Zum Warenkorb“ statt Modal.
- **Warenkorb:** Jede Position zeigt Bild, Name, Einzelpreis, Mengen-Dropdown, Zwischensumme und
  „Entfernen“ (unterstrichener Textlink mit kleinem Papierkorb-Symbol, per Tastatur erreichbar).
  Mengenänderungen wirken sofort, ohne „Speichern“. Liegt ein Produkt bereits im Warenkorb, zeigt
  die Produktseite unter dem Button „Bereits im Warenkorb: n Stück“.
- **Mengen-Dropdowns** sind native `<select>`-Felder (1–10), damit sie mobil die System-Auswahl nutzen.
- **`study_started`** wird beim Klick auf „Zum Online-Shop“ erfasst (einmal pro Token).
  `checkout_opened` wird bei jedem Öffnen des Checkouts erfasst, also auch nach Reload oder nach
  „Lieferoption ändern“.
- **Suche:** filtert die sechs Produkte nach Name und Beschreibung.
- **Schrift:** System-Schriftstack, keine externen Font-Downloads und damit keine Requests an Dritte.
- Seiten sind mit `noindex` markiert.

## Bekannte Einschränkungen der Demo

- Abschluss und Sperre sind nur lokal (`localStorage`). In einem anderen Browser oder nach dem
  Löschen der Browserdaten wäre eine erneute Teilnahme möglich. Die verbindliche Sperre muss
  serverseitig erfolgen (Integration Point B).
- Die Mock-Teilnehmerdaten sind im Client-Bundle enthalten. Das ist für Demo-Daten unkritisch
  und entfällt mit Integration Point A.
- Feiertage werden bei Lieferterminen nicht berücksichtigt.
