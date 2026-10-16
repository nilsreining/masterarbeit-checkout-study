/**
 * Kleine, fehlertolerante Hülle um localStorage.
 * Ist localStorage nicht nutzbar (z. B. durch Browser-Einstellungen blockiert), wird
 * sessionStorage verwendet – das genügt, damit ein Refresh im selben Tab den Fortschritt
 * behält. Schlägt beides fehl, läuft die Anwendung ohne Persistenz weiter, statt abzustürzen.
 */
const PREFIX = "checkout-study:v1";

export const storageKeys = {
  session: (token: string) => `${PREFIX}:session:${token}`,
  events: (token: string) => `${PREFIX}:events:${token}`,
  decision: (token: string) => `${PREFIX}:decision:${token}`,
  /** Nur sessionStorage: Entscheidung wurde in diesem Tab bestätigt (Abschlussseite nach Refresh). */
  completedInTab: (token: string) => `${PREFIX}:completed-in-tab:${token}`,
  prefix: PREFIX,
};

function isUsable(storage: Storage): boolean {
  const probe = `${PREFIX}:probe`;
  storage.setItem(probe, "1");
  storage.removeItem(probe);
  return true;
}

let cachedStorage: Storage | null | undefined;

/** localStorage, ersatzweise sessionStorage, sonst null. */
function getStorage(): Storage | null {
  if (cachedStorage !== undefined) return cachedStorage;
  for (const pick of [() => window.localStorage, () => window.sessionStorage]) {
    try {
      const storage = pick();
      if (isUsable(storage)) return (cachedStorage = storage);
    } catch {
      // nächsten Speicher versuchen
    }
  }
  return (cachedStorage = null);
}

export function readJson<T>(key: string): T | null {
  try {
    const raw = getStorage()?.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    getStorage()?.setItem(key, JSON.stringify(value));
  } catch {
    // Persistenz ist „best effort“.
  }
}

export function removeKey(key: string): void {
  try {
    getStorage()?.removeItem(key);
  } catch {
    // ignorieren
  }
}

/** Tab-bezogene Kennzeichen in sessionStorage (überstehen einen Refresh, nicht aber einen neuen Tab). */
export function readTabFlag(key: string): boolean {
  try {
    return window.sessionStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function writeTabFlag(key: string): void {
  try {
    window.sessionStorage.setItem(key, "1");
  } catch {
    // ignorieren
  }
}

export function removeTabFlag(key: string): void {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // ignorieren
  }
}
