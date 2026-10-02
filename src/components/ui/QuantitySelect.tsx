import { QUANTITY_OPTIONS } from "@/lib/cart";

/** Mengen-Auswahl 1–10 als natives Dropdown (gut bedienbar auf Desktop und mobil). */
export function QuantitySelect({
  id,
  value,
  onChange,
  label = "Menge",
  hideLabel = false,
  ariaLabel,
}: {
  id: string;
  value: number;
  onChange: (quantity: number) => void;
  label?: string;
  hideLabel?: boolean;
  /** Präziserer Name für Screenreader, z. B. „Menge für Trinkflasche Vela“. */
  ariaLabel?: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className={hideLabel ? "sr-only" : "text-sm text-neutral-700"}>
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={ariaLabel}
          className="h-9 cursor-pointer appearance-none rounded-md border border-neutral-300 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-neutral-900 hover:border-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
        >
          {QUANTITY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-500"
          aria-hidden="true"
        >
          <path d="m3 4.5 3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
