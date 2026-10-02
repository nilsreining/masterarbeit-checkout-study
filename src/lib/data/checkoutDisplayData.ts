/**
 * Fiktive, vorausgefüllte Checkout-Angaben (Lieferadresse, Zahlungsart).
 *
 * Reine Darstellung zur Erhöhung der Glaubwürdigkeit des Checkouts:
 * - für ALLE Teilnehmenden und beide Bedingungen identisch
 * - keine echten oder personenbezogenen Daten, keine Eingabe, keine Zahlung
 */
export const DISPLAY_SHIPPING_ADDRESS = {
  name: "Max Mustermann",
  street: "Musterstraße 18",
  postalCode: "10115",
  city: "Berlin",
  country: "Deutschland",
} as const;

export const DISPLAY_PAYMENT_METHOD = {
  label: "Kreditkarte",
  maskedNumber: "•••• •••• •••• 4242",
  expiry: "08/29",
} as const;
