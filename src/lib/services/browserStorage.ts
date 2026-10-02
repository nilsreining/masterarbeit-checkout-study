/**
 * Kleine, fehlertolerante Hülle um localStorage.
 * Schlägt der Zugriff fehl (z. B. Private Mode, Speicher voll), läuft die
 * Anwendung ohne Persistenz weiter, statt abzustürzen.
 */
const PREFIX = "checkout-study:v1";

export const storageKeys = {
  session: (token: string) => `${PREFIX}:session:${token}`,
  events: (token: string) => `${PREFIX}:events:${token}`,
  decision: (token: string) => `${PREFIX}:decision:${token}`,
  prefix: PREFIX,
};

export function readJson<T>(key: string): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function writeJson(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistenz ist in der Demo „best effort“.
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignorieren
  }
}
