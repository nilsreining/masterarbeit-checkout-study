import { DISPLAY_SHIPPING_ADDRESS as address } from "@/lib/data/checkoutDisplayData";

/** Hinterlegte (fiktive) Lieferadresse – reine Anzeige. */
export function ShippingAddress() {
  return (
    <div className="flex items-start gap-3">
      <HomeIcon />
      <address className="text-sm not-italic leading-6 text-neutral-800">
        <span className="font-medium text-neutral-900">{address.name}</span>
        <br />
        {address.street}
        <br />
        {address.postalCode} {address.city}
        <br />
        {address.country}
      </address>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="mt-0.5 shrink-0 text-neutral-400"
      aria-hidden="true"
    >
      <path d="M3.5 10.5 12 4l8.5 6.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.5 9v10.5h13V9" strokeLinejoin="round" />
      <path d="M10 19.5v-5h4v5" strokeLinejoin="round" />
    </svg>
  );
}
