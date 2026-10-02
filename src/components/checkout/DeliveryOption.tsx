import type { DeliveryChoice } from "@/lib/types";

interface DeliveryOptionProps {
  value: DeliveryChoice;
  title: string;
  dateLabel: string;
  priceLabel: string;
  checked: boolean;
  onSelect: (value: DeliveryChoice) => void;
  /** ID eines zugehörigen Hinweises (aria-describedby). */
  describedBy?: string;
  /** Optionaler Zusatz unterhalb von Datum/Preis (z. B. Hinweis-Box). Mobil volle Kartenbreite, ab sm eingerückt. */
  children?: React.ReactNode;
}

/**
 * Eine auswählbare Lieferoption (native Radio-Input, vollständig per Tastatur bedienbar).
 * Die gesamte Fläche ist anklickbar. Beide Optionen nutzen exakt dieses Layout.
 */
export function DeliveryOption({
  value,
  title,
  dateLabel,
  priceLabel,
  checked,
  onSelect,
  describedBy,
  children,
}: DeliveryOptionProps) {
  const inputId = `delivery-${value}`;
  return (
    <label
      htmlFor={inputId}
      className={`grid cursor-pointer grid-cols-[auto_minmax(0,1fr)] gap-x-3 rounded-md border px-4 py-3.5 transition-colors ${
        checked ? "border-neutral-900 bg-white ring-1 ring-neutral-900" : "border-neutral-300 bg-white hover:border-neutral-400"
      }`}
    >
      <input
        id={inputId}
        type="radio"
        name="delivery-option"
        value={value}
        checked={checked}
        onChange={() => onSelect(value)}
        aria-describedby={describedBy}
        className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-neutral-900"
      />
      <span className="min-w-0">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-sm font-semibold text-neutral-900">{title}</span>
          <span className="shrink-0 text-sm text-neutral-900">{priceLabel}</span>
        </span>
        <span className="mt-0.5 block text-sm text-neutral-700">Lieferung: {dateLabel}</span>
      </span>
      {children && <span className="col-span-2 mt-3 block sm:col-span-1 sm:col-start-2">{children}</span>}
    </label>
  );
}
