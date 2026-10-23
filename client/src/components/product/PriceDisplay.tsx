import type { PriceDisplayProps } from "../../types/product";

const nairaFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export function formatNaira(amount: number): string {
  return nairaFormatter.format(amount);
}

export default function PriceDisplay({
  price,
  compareAtPrice,
  size = "md",
  className = "",
}: PriceDisplayProps) {
  const hasDiscount =
    typeof compareAtPrice === "number" && compareAtPrice > price;

  const sizeClasses = {
    sm: "text-sm",
    md: "text-base sm:text-lg",
    lg: "text-xl sm:text-2xl",
  };

  return (
    <div
      className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`}
    >
      <span
        className={`font-bold tracking-tight text-[var(--color-ink)] ${sizeClasses[size]}`}
      >
        {formatNaira(price)}
      </span>

      {hasDiscount && (
        <span className="text-xs font-medium text-[var(--color-muted)] line-through">
          {formatNaira(compareAtPrice)}
        </span>
      )}
    </div>
  );
}
