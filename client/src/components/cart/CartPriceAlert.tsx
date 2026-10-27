import { memo } from "react";
import { FiAlertCircle, FiX } from "react-icons/fi";
import { useCart } from "../../hooks/useCart";
import { formatNaira } from "../../utils/cartUtils";

function CartPriceAlert() {
  const { priceChanges, dismissPriceChange } = useCart();

  if (priceChanges.length === 0) return null;

  return (
    <section
      aria-label="Cart price updates"
      aria-live="polite"
      className="space-y-2"
    >
      {priceChanges.map((change) => {
        const priceIncreased = change.currentPrice > change.previousPrice;

        return (
          <div
            key={change.productId}
            className="flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-warning-soft)] bg-[var(--color-warning-soft)] p-3 sm:p-4"
          >
            <FiAlertCircle
              size={20}
              aria-hidden="true"
              className="mt-0.5 shrink-0 text-[var(--color-warning)]"
            />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[var(--color-ink)]">
                Price updated for {change.productName}
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                The price has {priceIncreased ? "increased" : "decreased"} from{" "}
                <span className="font-medium text-[var(--color-ink)]">
                  {formatNaira(change.previousPrice)}
                </span>{" "}
                to{" "}
                <span className="font-semibold text-[var(--color-ink)]">
                  {formatNaira(change.currentPrice)}
                </span>
                .
              </p>
            </div>

            <button
              type="button"
              onClick={() => dismissPriceChange(change.productId)}
              aria-label={`Dismiss price update for ${change.productName}`}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-[var(--color-muted)] transition-colors hover:bg-white/70 hover:text-[var(--color-ink)]"
            >
              <FiX size={16} aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </section>
  );
}

export default memo(CartPriceAlert);
