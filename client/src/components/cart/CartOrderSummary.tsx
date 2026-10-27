import { memo } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight, FiInfo } from "react-icons/fi";
import { useCart } from "../../hooks/useCart";
import { DEFAULT_DELIVERY_FEE, formatNaira } from "../../utils/cartUtils";
import CartPromoCode from "./CartPromoCode";

interface CartOrderSummaryProps {
  deliveryFee?: number;
  onCheckout?: () => void;
  checkoutDisabled?: boolean;
  onApplyPromoCode?: (code: string) => void | Promise<void>;
}

function CartOrderSummary({
  deliveryFee = DEFAULT_DELIVERY_FEE,
  onCheckout,
  checkoutDisabled = false,
  onApplyPromoCode,
}: CartOrderSummaryProps) {
  const { selectedSubtotal, selectedLineCount, isAnySelected } = useCart();

  const hasSelectedItems = isAnySelected && selectedSubtotal > 0;
  const actualDeliveryFee = hasSelectedItems ? deliveryFee : 0;
  const total = selectedSubtotal + actualDeliveryFee;

  function handleCheckout() {
    if (!hasSelectedItems || checkoutDisabled) return;

    onCheckout?.();
  }

  return (
    <aside
      aria-labelledby="cart-summary-heading"
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-sm)] sm:p-5"
    >
      <h2
        id="cart-summary-heading"
        className="text-lg font-bold tracking-tight sm:text-xl"
      >
        Order Summary
      </h2>

      <dl className="mt-5 space-y-4">
        <div className="flex items-start justify-between gap-4 text-sm">
          <dt className="text-[var(--color-muted)]">
            Subtotal ({selectedLineCount}{" "}
            {selectedLineCount === 1 ? "item" : "items"})
          </dt>
          <dd className="shrink-0 text-right font-semibold tabular-nums">
            {formatNaira(selectedSubtotal)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <dt className="flex items-center gap-1.5 text-[var(--color-muted)]">
            Delivery estimate
            <span title="Estimated delivery fee; final charges may vary.">
              <FiInfo
                size={14}
                aria-label="Delivery fee is an estimate"
                role="img"
              />
            </span>
          </dt>
          <dd className="shrink-0 text-right font-semibold tabular-nums">
            {formatNaira(actualDeliveryFee)}
          </dd>
        </div>
      </dl>

      <div className="my-4 border-t border-[var(--color-border)]" />

      <div className="flex items-center justify-between gap-4">
        <h3 className="text-base font-bold">Total</h3>
        <p className="text-lg font-extrabold tabular-nums sm:text-xl">
          {formatNaira(total)}
        </p>
      </div>

      <button
        type="button"
        onClick={handleCheckout}
        disabled={!hasSelectedItems || checkoutDisabled}
        className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Proceed to Checkout
        <FiArrowRight size={17} aria-hidden="true" />
      </button>

      <CartPromoCode
        onApplyCode={onApplyPromoCode}
        disabled={!hasSelectedItems}
      />

      {!onCheckout && (
        <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">
          Checkout navigation will be connected when we implement the
          account-required checkout flow.
        </p>
      )}

      <Link
        to="/shop"
        className="mt-3 inline-flex w-full items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-4 py-3 text-sm font-semibold transition-colors hover:bg-[var(--color-paper)]"
      >
        Continue Shopping
      </Link>
    </aside>
  );
}

export default memo(CartOrderSummary);
