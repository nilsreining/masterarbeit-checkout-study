"use client";

/**
 * StudyProvider – zentraler Zustand von Teil 2.
 *
 * - liest den Token aus der URL und lädt den Teilnehmer AUSSCHLIESSLICH über participantService
 * - hält den lokalen Fortschritt (sessionStore) pro Token
 * - reichert Events automatisch mit Token, Condition, Warenkorb und Lieferauswahl an
 * - erzeugt beim Bestätigen die finale Lieferentscheidung
 * - behandelt ungültige Links und bereits abgeschlossene Teilnahmen zentral
 *
 * Die UI-Komponenten kennen die Condition nicht und brauchen sie auch nicht:
 * Sie erhalten nur den anzuzeigenden Hinweistext.
 */
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { InvalidLink, StudyLoadError, StudyLoading } from "@/components/study/StudyStatus";
import * as cartLogic from "../cart";
import { computeDeliveryDates } from "../services/dateService";
import { getParticipantByToken, normalizeToken } from "../services/participantService";
import { loadSession, saveSession } from "../services/sessionStore";
import { studyEventService } from "../services/studyEventService";
import { buildPostSurveyUrl, DEFAULT_DELIVERY } from "../studyConfig";
import type {
  DeliveryChoice,
  DeliveryDecision,
  Participant,
  ParticipantLookupResult,
  ProductId,
  StudyEvent,
  StudyEventType,
  StudySession,
} from "../types";
import { exposeStudyDebug } from "./debug";
import { ROUTES, withToken } from "./routes";

interface TrackOptions {
  /** Hinweistext mitschreiben (nur wenn er gerade sichtbar ist bzw. für die Entscheidung relevant). */
  includeNudge?: boolean;
  /** Warenkorb-Kennzahlen (numberOfDifferentProducts, totalQuantity, cartTotal, cartItems) mitschreiben. */
  includeCartSnapshot?: boolean;
  details?: StudyEvent["details"];
}

interface StudyContextValue extends StudyActions {
  token: string;
  participant: Participant;
  session: StudySession;
  /** true nur direkt nach „Auswahl bestätigen“ in diesem Seitenaufruf (für die Abschlussseite). */
  completedInThisVisit: boolean;
}

interface StudyActions {
  /** Hängt den Token (und optionale weitere Parameter) an einen Pfad an. */
  href: (path: string, extra?: Record<string, string>) => string;
  /** Liefert ein Promise, das nie rejected – kann ignoriert oder (z. B. vor Seitenwechseln) abgewartet werden. */
  track: (eventType: StudyEventType, options?: TrackOptions) => Promise<void>;
  startStudy: () => void;
  /**
   * Legt `quantity` Stück in den Warenkorb. Ist das Produkt schon enthalten, wird die
   * Menge addiert (höchstens MAX_CART_QUANTITY pro Produkt).
   */
  addToCart: (productId: ProductId, quantity: number) => AddToCartResult;
  /** Setzt die Menge einer vorhandenen Position (1–MAX_CART_QUANTITY). */
  updateQuantity: (productId: ProductId, quantity: number) => void;
  /** Entfernt die komplette Position; andere Produkte bleiben erhalten. */
  removeFromCart: (productId: ProductId) => void;
  setDeliveryChoice: (choice: DeliveryChoice) => void;
  ensureDeliveryDates: () => void;
  confirmDecision: () => Promise<void>;
  openPostSurvey: () => Promise<void>;
}

export interface AddToCartResult {
  /** true, wenn das Produkt vorher schon im Warenkorb lag (Menge wurde erhöht). */
  wasInCart: boolean;
  resultingQuantity: number;
  /** true, wenn die Höchstmenge erreicht wurde und nicht alles hinzugefügt werden konnte. */
  limited: boolean;
}

const StudyContext = createContext<StudyContextValue | null>(null);

export function useStudy(): StudyContextValue {
  const value = useContext(StudyContext);
  if (!value) {
    throw new Error("useStudy() muss innerhalb von <StudyProvider> verwendet werden.");
  }
  return value;
}

/** Führt `fn` genau einmal aus, sobald `enabled` true ist (robust gegen React-StrictMode-Doppelaufrufe). */
export function useRunOnce(enabled: boolean, fn: () => void): void {
  const done = useRef(false);
  useEffect(() => {
    if (!enabled || done.current) return;
    done.current = true;
    fn();
  }, [enabled, fn]);
}

/** Ganze Sekunden zwischen zwei ISO-Zeitstempeln (nie negativ); null, wenn der Start fehlt. */
function secondsBetween(startIso: string | null, endIso: string): number | null {
  if (!startIso) return null;
  const ms = Date.parse(endIso) - Date.parse(startIso);
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 1000)) : null;
}

/** Maximale Wartezeit auf das Tracking, bevor zur Befragung weitergeleitet wird. */
const POST_SURVEY_TRACK_TIMEOUT_MS = 1500;

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const token = normalizeToken(useSearchParams().get("token"));

  if (!token) {
    return <InvalidLink />;
  }
  // key: Bei einem anderen Token wird der komplette Zustand neu aufgebaut.
  return (
    <StudyProviderForToken key={token} token={token}>
      {children}
    </StudyProviderForToken>
  );
}

type LoadState =
  | { status: "loading" }
  | { status: "not_found" }
  | { status: "error" }
  | { status: "ready"; participant: Participant; session: StudySession };

function StudyProviderForToken({ token, children }: { token: string; children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [completedInThisVisit, setCompletedInThisVisit] = useState(false);
  const sessionRef = useRef<StudySession | null>(null);
  const participantRef = useRef<Participant | null>(null);
  const confirmingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let result: ParticipantLookupResult;
      try {
        result = await getParticipantByToken(token);
      } catch {
        result = { status: "error" };
      }
      if (cancelled) return;
      if (result.status !== "found") {
        setState({ status: result.status });
        return;
      }
      const session = loadSession(token);
      sessionRef.current = session;
      participantRef.current = result.participant;
      setState({ status: "ready", participant: result.participant, session });
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const isCompleted =
    state.status === "ready" && (state.participant.studyCompleted || state.session.completed);
  const mustRedirectToCompletion = isCompleted && pathname !== ROUTES.complete;

  useEffect(() => {
    if (mustRedirectToCompletion) {
      router.replace(withToken(ROUTES.complete, token));
    }
  }, [mustRedirectToCompletion, router, token]);

  const updateSession = useCallback((patch: Partial<StudySession>) => {
    const current = sessionRef.current;
    if (!current) return;
    const next = { ...current, ...patch };
    sessionRef.current = next;
    saveSession(next);
    setState((s) => (s.status === "ready" ? { ...s, session: next } : s));
  }, []);

  const track = useCallback(
    (eventType: StudyEventType, options: TrackOptions = {}) => {
      const session = sessionRef.current;
      const participant = participantRef.current;
      if (!session || !participant) return Promise.resolve();
      const event: StudyEvent = {
        eventId: crypto.randomUUID(),
        eventType,
        participantToken: token,
        condition: participant.condition,
        timestamp: new Date().toISOString(),
        cart: session.cart,
        deliveryChoice: session.deliveryDates ? session.deliveryChoice : null,
        displayedNudge: options.includeNudge ? participant.nudgeText : null,
        ...(options.details ? { details: options.details } : {}),
        ...(options.includeCartSnapshot ? cartLogic.createCartSnapshot(session.cart) : {}),
      };
      // Tracking-Fehler dürfen den Ablauf nie blockieren.
      return studyEventService.track(event).catch(() => undefined);
    },
    [token],
  );

  /** Aktionen lesen den aktuellen Zustand über Refs und sind daher unabhängig vom Render-State. */
  const actions = useMemo<StudyActions>(
    () => ({
      href: (path, extra) => withToken(path, token, extra),
      track,

      startStudy() {
        if (!sessionRef.current?.studyStarted) {
          updateSession({ studyStarted: true });
          track("study_started");
        }
      },

      addToCart(productId, quantity) {
        const result = cartLogic.addToCart(sessionRef.current?.cart ?? [], productId, quantity);
        if (result.quantityAdded > 0) {
          updateSession({ cart: result.cart });
          track("product_added", {
            details: {
              productId,
              quantityAdded: result.quantityAdded,
              resultingQuantity: result.resultingQuantity,
            },
          });
        }
        return { wasInCart: result.wasInCart, resultingQuantity: result.resultingQuantity, limited: result.limited };
      },

      updateQuantity(productId, quantity) {
        const cart = sessionRef.current?.cart ?? [];
        const oldQuantity = cartLogic.getQuantity(cart, productId);
        const newQuantity = cartLogic.clampQuantity(quantity);
        if (oldQuantity === 0 || oldQuantity === newQuantity) return;
        updateSession({ cart: cartLogic.setQuantity(cart, productId, newQuantity) });
        track("product_quantity_changed", { details: { productId, oldQuantity, newQuantity } });
      },

      removeFromCart(productId) {
        const cart = sessionRef.current?.cart ?? [];
        const removedQuantity = cartLogic.getQuantity(cart, productId);
        if (removedQuantity === 0) return;
        updateSession({ cart: cartLogic.removeFromCart(cart, productId) });
        track("product_removed", { details: { productId, removedQuantity } });
      },

      setDeliveryChoice(choice) {
        const previous = sessionRef.current?.deliveryChoice;
        if (!previous || previous === choice) return;
        updateSession({ deliveryChoice: choice });
        track("delivery_option_changed", { includeNudge: true, details: { from: previous, to: choice } });
      },

      ensureDeliveryDates() {
        const session = sessionRef.current;
        if (!session) return;
        // Beim ersten Öffnen des Checkouts: Liefertermine festlegen und Startzeit der Entscheidung merken.
        if (!session.deliveryDates || !session.firstCheckoutOpenedAt) {
          updateSession({
            deliveryDates: session.deliveryDates ?? computeDeliveryDates(),
            firstCheckoutOpenedAt: session.firstCheckoutOpenedAt ?? new Date().toISOString(),
          });
        }
      },

      async confirmDecision() {
        const session = sessionRef.current;
        const participant = participantRef.current;
        if (!session || !participant || session.completed || confirmingRef.current) return;
        const cartSnapshot = cartLogic.createCartSnapshot(session.cart);
        if (cartSnapshot.cartItems.length === 0 || !session.deliveryDates) return;

        confirmingRef.current = true;
        try {
          const decisionTimestamp = new Date().toISOString();
          const decision: DeliveryDecision = {
            participantToken: token,
            condition: participant.condition,
            ...cartSnapshot,
            deliveryChoice: session.deliveryChoice,
            defaultDelivery: DEFAULT_DELIVERY,
            switchedFromDefault: session.deliveryChoice !== DEFAULT_DELIVERY,
            displayedNudge: participant.nudgeText,
            decisionTimestamp,
            firstCheckoutOpenedAt: session.firstCheckoutOpenedAt,
            decisionTimeSeconds: secondsBetween(session.firstCheckoutOpenedAt, decisionTimestamp),
            standardDeliveryDate: session.deliveryDates.standard,
            bundledDeliveryDate: session.deliveryDates.bundled,
          };
          // INTEGRATION POINT B: Übertragung der finalen Entscheidung.
          // Wirft bei Netzwerk-/Speicherfehlern → OrderReview zeigt eine neutrale Fehlermeldung,
          // die Studie gilt dann NICHT als abgeschlossen und kann erneut bestätigt werden.
          const result = await studyEventService.submitDecision(decision);
          if (result.status === "already_completed") {
            // Server hat bereits eine Entscheidung für diesen Token → bestehende Sperrlogik
            // („Sie haben diesen Teil der Studie bereits abgeschlossen.“).
            updateSession({ completed: true });
            return;
          }
          track("choice_confirmed", {
            includeNudge: true,
            includeCartSnapshot: true,
            details: { switchedFromDefault: decision.switchedFromDefault },
          });
          setCompletedInThisVisit(true);
          // Löst über mustRedirectToCompletion die Weiterleitung zur Abschlussseite aus.
          updateSession({ completed: true });
        } finally {
          confirmingRef.current = false;
        }
      },

      async openPostSurvey() {
        // Begrenzt warten, damit ein (späterer) Netzwerk-Request vor dem Seitenwechsel abgeschlossen wird.
        await Promise.race([
          track("post_survey_opened"),
          new Promise((resolve) => setTimeout(resolve, POST_SURVEY_TRACK_TIMEOUT_MS)),
        ]);
        // INTEGRATION POINT C: URL inkl. Token wird zentral in studyConfig erzeugt.
        window.location.assign(buildPostSurveyUrl(token));
      },
    }),
    [token, track, updateSession],
  );

  const value = useMemo<StudyContextValue | null>(
    () =>
      state.status === "ready"
        ? { ...actions, token, participant: state.participant, session: state.session, completedInThisVisit }
        : null,
    [actions, state, token, completedInThisVisit],
  );

  useEffect(() => {
    if (state.status === "ready") {
      exposeStudyDebug(token, state.participant, state.session);
    }
  }, [state, token]);

  if (state.status === "loading") return <StudyLoading />;
  if (state.status === "not_found") return <InvalidLink />;
  if (state.status === "error") return <StudyLoadError />;
  if (mustRedirectToCompletion) return <StudyLoading />;

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
}
