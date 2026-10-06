/**
 * Zentrale Typdefinitionen der Studienanwendung.
 *
 * Das Datenmodell ist bewusst minimal: Der Checkout arbeitet ausschließlich
 * pseudonym über den Token. Rohdaten aus dem ersten Fragebogen (Scores,
 * Namen, E-Mail-Adressen …) werden hier weder benötigt noch modelliert.
 */

/** Experimentalbedingung. Wird VOR Aufruf der Anwendung festgelegt (keine Randomisierung im Browser). */
export type Condition = "generic" | "personalized";

/** Teilnehmerdatensatz, wie ihn die Anwendung vom Backend (aktuell: Mock) erhält. */
export interface Participant {
  /** Pseudonymer Teilnehmer-Token aus dem individuellen Studienlink (dient zugleich als participantId). */
  token: string;
  condition: Condition;
  /** Vorab erzeugter Hinweistext, der bei der gebündelten Lieferung angezeigt wird. */
  nudgeText: string;
  /** Serverseitiger Abschlussstatus von Teil 2. */
  studyCompleted: boolean;
}

export type ParticipantLookupResult =
  | { status: "found"; participant: Participant }
  | { status: "not_found" }
  | { status: "error" };

export type DeliveryChoice = "standard" | "bundled";

/** Liefertermine als ISO-Datum (YYYY-MM-DD, Kalendertag in Europe/Berlin). */
export interface DeliveryDates {
  standard: string;
  bundled: string;
}

export type ProductId =
  | "trinkflasche"
  | "powerbank"
  | "lautsprecher"
  | "schreibtischlampe"
  | "kopfhoerer"
  | "rucksack";

export interface Product {
  id: ProductId;
  name: string;
  shortDescription: string;
  description: string;
  features: string[];
  /** Preis in Cent (Ganzzahl, vermeidet Rundungsfehler). */
  priceCents: number;
  rating: number;
  reviewCount: number;
  /** Produktbild unter public/ (z. B. /products/rucksack.svg oder später ein Foto /products/rucksack.jpg). */
  imageUrl?: string;
}

/** Eine Warenkorb-Position. Jedes Produkt kommt höchstens einmal vor; die Stückzahl steht in quantity. */
export interface CartItem {
  productId: ProductId;
  /** Ganzzahl von 1 bis MAX_CART_QUANTITY (siehe lib/cart.ts). */
  quantity: number;
}

/** Warenkorb-Position für die Auswertung (Preise in Euro, zwei Nachkommastellen). */
export interface CartSnapshotItem {
  productId: ProductId;
  quantity: number;
  /** Einzelpreis in Euro, z. B. 24.99 */
  unitPrice: number;
  /** unitPrice × quantity in Euro, z. B. 49.98 */
  lineTotal: number;
}

/**
 * Auswertungsrelevanter Warenkorbzustand zu einem Zeitpunkt (z. B. beim Öffnen des
 * Checkouts und bei der finalen Lieferentscheidung).
 */
export interface CartSnapshot {
  /** Anzahl unterschiedlicher Produkte im Warenkorb. */
  numberOfDifferentProducts: number;
  /** Summe aller Mengen im Warenkorb. */
  totalQuantity: number;
  /** Gesamtwert in Euro inkl. Versand (aktuell kostenlos), z. B. 129.95 */
  cartTotal: number;
  cartItems: CartSnapshotItem[];
}

export const STUDY_EVENT_TYPES = [
  "study_started",
  "product_viewed",
  "product_added",
  "product_quantity_changed",
  "product_removed",
  "cart_opened",
  "checkout_opened",
  "delivery_option_changed",
  "order_reviewed",
  "choice_confirmed",
  "post_survey_opened",
] as const;

export type StudyEventType = (typeof STUDY_EVENT_TYPES)[number];

export interface StudyEvent {
  eventId: string;
  eventType: StudyEventType;
  participantToken: string;
  condition: Condition;
  /** ISO-8601-Zeitstempel (Client-Zeit). */
  timestamp: string;
  /** Warenkorb zum Zeitpunkt des Events (nach Ausführung der Aktion). */
  cart: CartItem[];
  deliveryChoice: DeliveryChoice | null;
  /** Nur gesetzt, wenn der Hinweis im Moment des Events sichtbar war bzw. für die Entscheidung relevant ist. */
  displayedNudge: string | null;
  /** Ereignisspezifische Zusatzinformationen (z. B. vorherige Lieferoption). */
  details?: Record<string, string | number | boolean | null>;
  /** Warenkorb-Kennzahlen – nur bei checkout_opened und choice_confirmed gesetzt. */
  numberOfDifferentProducts?: number;
  totalQuantity?: number;
  cartTotal?: number;
  cartItems?: CartSnapshotItem[];
}

/**
 * Zentrale Studienvariable: wird genau einmal beim Klick auf
 * „Auswahl bestätigen“ erzeugt.
 */
export interface DeliveryDecision extends CartSnapshot {
  participantToken: string;
  condition: Condition;
  deliveryChoice: DeliveryChoice;
  defaultDelivery: "standard";
  switchedFromDefault: boolean;
  displayedNudge: string;
  /** ISO-8601-Zeitstempel (Client-Zeit). */
  decisionTimestamp: string;
  /** Erstes Öffnen des Checkouts (ISO-8601, Client-Zeit); null bei sehr alten lokalen Sessions. */
  firstCheckoutOpenedAt: string | null;
  /** Ganze Sekunden von firstCheckoutOpenedAt bis decisionTimestamp; null, wenn nicht bestimmbar. */
  decisionTimeSeconds: number | null;
  standardDeliveryDate: string;
  bundledDeliveryDate: string;
}

/** Ergebnis von submitDecision(). Technische Fehler werden als rejected Promise gemeldet. */
export type SubmitDecisionResult =
  | { status: "saved" }
  /** Server kennt für diesen Token bereits eine Entscheidung → bestehende Sperrlogik verwenden. */
  | { status: "already_completed" };

/** Lokal (pro Token) gespeicherter Fortschritt, damit ein Reload nichts verliert. */
export interface StudySession {
  version: 2;
  token: string;
  studyStarted: boolean;
  /** Warenkorb: beliebig viele verschiedene Produkte mit Stückzahl (Reihenfolge des ersten Hinzufügens). */
  cart: CartItem[];
  deliveryChoice: DeliveryChoice;
  /** Wird beim ersten Öffnen des Checkouts festgelegt und danach nicht mehr verändert. */
  deliveryDates: DeliveryDates | null;
  /** Zeitpunkt des ersten Öffnens des Checkouts (ISO-8601), Basis für decisionTimeSeconds. */
  firstCheckoutOpenedAt: string | null;
  completed: boolean;
}
