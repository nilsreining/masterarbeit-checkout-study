import { formatCount, formatRating } from "@/lib/format";

export function StarRating({ rating, reviewCount }: { rating: number; reviewCount: number }) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-neutral-600">
      <span className="flex" aria-hidden="true">
        {[0, 1, 2, 3, 4].map((i) => {
          const fill = Math.max(0, Math.min(1, rating - i));
          return <Star key={i} fill={fill} />;
        })}
      </span>
      <span className="sr-only">{formatRating(rating)} von 5 Sternen,</span>
      <span>
        <span aria-hidden="true">{formatRating(rating)} </span>({formatCount(reviewCount)}
        <span className="sr-only"> Bewertungen</span>)
      </span>
    </div>
  );
}

/** Stern mit anteiliger Füllung (0–1). */
function Star({ fill }: { fill: number }) {
  return (
    <span className="relative inline-block h-4 w-4">
      <StarShape className="absolute inset-0 text-neutral-300" />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
        <StarShape className="h-4 w-4 text-amber-500" />
      </span>
    </span>
  );
}

function StarShape({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={`h-4 w-4 ${className}`}>
      <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9l-5.2 2.7 1-5.8L1.5 7.7l5.9-.9L10 1.5z" />
    </svg>
  );
}
