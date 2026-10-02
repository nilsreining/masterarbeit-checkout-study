/**
 * Produktkatalog des simulierten Shops.
 *
 * Für ALLE Teilnehmenden und beide Bedingungen identisch. Die Produkte sind
 * bewusst ähnlich bepreist und bewertet, damit keines hervorsticht. Keine
 * Nachhaltigkeitsmerkmale, Empfehlungen oder Labels.
 */
import type { Product, ProductId } from "../types";

export const PRODUCTS: readonly Product[] = [
  {
    id: "trinkflasche",
    imageUrl: "/products/trinkflasche.svg",
    name: "Trinkflasche Vela 750 ml",
    shortDescription: "Doppelwandige Isolierflasche aus Edelstahl mit Schraubverschluss.",
    description:
      "Die Vela hält Getränke lange kalt oder warm und passt in die meisten Fahrrad- und Autohalterungen. Der Schraubverschluss ist auslaufsicher, die pulverbeschichtete Oberfläche liegt gut in der Hand.",
    features: [
      "Fassungsvermögen 750 ml",
      "Hält Getränke bis zu 24 h kalt bzw. 12 h warm",
      "Auslaufsicherer Schraubverschluss",
      "Pulverbeschichtete Oberfläche in Anthrazit",
    ],
    priceCents: 2499,
    rating: 4.5,
    reviewCount: 412,
  },
  {
    id: "powerbank",
    imageUrl: "/products/powerbank.svg",
    name: "Powerbank Kora 10.000 mAh",
    shortDescription: "Kompakter Zusatzakku mit USB-C, lädt zwei Geräte gleichzeitig.",
    description:
      "Die Kora lädt Smartphone, Kopfhörer oder Tablet unterwegs zuverlässig auf. Dank USB-C Power Delivery ist der Akku selbst in rund drei Stunden wieder voll.",
    features: [
      "Kapazität 10.000 mAh",
      "USB-C (20 W) und USB-A",
      "Ladestandsanzeige mit vier LEDs",
      "Gewicht ca. 190 g",
    ],
    priceCents: 2999,
    rating: 4.4,
    reviewCount: 538,
  },
  {
    id: "lautsprecher",
    imageUrl: "/products/lautsprecher.svg",
    name: "Bluetooth-Lautsprecher Ondo",
    shortDescription: "Tragbarer Lautsprecher mit klarem Klang und 12 Stunden Laufzeit.",
    description:
      "Der Ondo liefert ausgewogenen Klang für drinnen und draußen. Das robuste Gehäuse ist spritzwassergeschützt, die Verbindung erfolgt per Bluetooth 5.3.",
    features: [
      "Bis zu 12 Stunden Akkulaufzeit",
      "Spritzwassergeschützt nach IPX5",
      "Bluetooth 5.3, Reichweite bis 10 m",
      "Integriertes Mikrofon zum Telefonieren",
    ],
    priceCents: 3999,
    rating: 4.5,
    reviewCount: 367,
  },
  {
    id: "schreibtischlampe",
    imageUrl: "/products/schreibtischlampe.svg",
    name: "LED-Schreibtischlampe Lino",
    shortDescription: "Dimmbare Leuchte mit verstellbarem Arm und drei Lichtfarben.",
    description:
      "Die Lino sorgt am Arbeitsplatz für gleichmäßiges, blendfreies Licht. Helligkeit und Lichtfarbe lassen sich per Touch-Bedienfeld stufenlos anpassen.",
    features: [
      "Stufenlos dimmbar per Touch",
      "Drei Lichtfarben (warm, neutral, kalt)",
      "Gelenkarm und Kopf verstellbar",
      "Standfuß mit USB-A-Ladeanschluss",
    ],
    priceCents: 3499,
    rating: 4.6,
    reviewCount: 289,
  },
  {
    id: "kopfhoerer",
    imageUrl: "/products/kopfhoerer.svg",
    name: "Over-Ear-Kopfhörer Arvo",
    shortDescription: "Kabellose Kopfhörer mit weichen Ohrpolstern und langer Laufzeit.",
    description:
      "Die Arvo bieten angenehmen Tragekomfort auch über längere Zeit. Die Bedienung erfolgt über Tasten an der Ohrmuschel, für Reisen lassen sie sich platzsparend zusammenklappen.",
    features: [
      "Bis zu 30 Stunden Akkulaufzeit",
      "Weiche Ohrpolster aus Memory-Schaum",
      "Faltbar, inklusive Transporttasche",
      "Bluetooth 5.3 und 3,5-mm-Klinke",
    ],
    priceCents: 4999,
    rating: 4.4,
    reviewCount: 451,
  },
  {
    id: "rucksack",
    imageUrl: "/products/rucksack.svg",
    name: "Rucksack Tero 20 l",
    shortDescription: "Alltagsrucksack mit gepolstertem Laptopfach und Seitentaschen.",
    description:
      "Der Tero ist für Arbeit, Uni und Freizeit gemacht. Das gepolsterte Fach schützt Laptops bis 15 Zoll, gepolsterte Schultergurte sorgen für angenehmen Tragekomfort.",
    features: [
      "Volumen 20 Liter",
      "Gepolstertes Laptopfach bis 15 Zoll",
      "Wasserabweisendes Material",
      "Zwei Seitentaschen für Flaschen oder Schirm",
    ],
    priceCents: 4499,
    rating: 4.5,
    reviewCount: 326,
  },
];

export function getProductById(id: string | null | undefined): Product | undefined {
  return PRODUCTS.find((product) => product.id === id);
}

export function isProductId(id: string): id is ProductId {
  return PRODUCTS.some((product) => product.id === id);
}
