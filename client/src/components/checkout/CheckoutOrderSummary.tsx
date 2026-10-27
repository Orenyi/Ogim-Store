import { Link } from "react-router-dom";
import { FiArrowRight, FiShield, FiTruck, FiRotateCcw } from "react-icons/fi";

import { useCart } from "../../hooks/useCart";
import type { ProductCondition } from "../../types/product";

interface CheckoutOrderSummaryProps {
  deliveryFee?: number;
  showEditLink?: boolean;
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const conditionLabels: Record<ProductCondition, string> = {
  new: "Brand new",
  "uk-used": "UK used",
  refurbished: "Refurbished",
};

export default function CheckoutOrderSummary({
  deliveryFee = 0,
  showEditLink = true,
}: CheckoutOrderSummaryProps) {
  const { items, selectedSubtotal, selectedItemCount, isHydrated } = useCart();

  const selectedItems = items.filter((item) => item.selected);
  const total = selectedSubtotal + deliveryFee;

  if (!isHydrated) {
    return (
      <aside
        aria-label="Order summary"
        className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-5"
      >
        <div className="mb-5 h-5 w-36 animate-pulse rounded bg-[var(--color-stone)]" />

        <div className="space-y-4">
          {[1, 2].map((item) => (
            <div key={item} className="flex gap-3">
              <div className="h-[76px] w-[68px] animate-pulse rounded-[var(--radius-control)] bg-[var(--color-stone)]" />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-3 w-3/4 animate-pulse rounded bg-[var(--color-stone)]" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-[var(--color-stone)]" />
              </div>
            </div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside
      aria-label="Order summary"
      className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-extrabold tracking-[-0.025em]">
          Order summary
        </h2>

        {showEditLink && (
          <Link
            to="/cart"
            className="shrink-0 text-sm font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            Edit cart
          </Link>
        )}
      </div>

      <p className="mt-1 text-sm text-[var(--color-muted)]">
        {selectedItemCount} {selectedItemCount === 1 ? "item" : "items"}{" "}
        selected
      </p>

      {selectedItems.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-sm leading-6 text-[var(--color-muted)]">
            Your checkout has no selected items.
          </p>

          {showEditLink && (
            <Link
              to="/cart"
              className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)]"
            >
              Return to cart
              <FiArrowRight size={15} aria-hidden="true" />
            </Link>
          )}
        </div>
      ) : (
        <>
          <ul className="mt-5 divide-y divide-[var(--color-border)]">
            {selectedItems.map((item) => (
              <li
                key={item.product.id}
                className="flex gap-3 py-4 first:pt-0 last:pb-0"
              >
                <div className="relative h-[82px] w-[74px] shrink-0 overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-surface-muted)]">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    loading="lazy"
                    className="h-full w-full object-contain p-1"
                  />

                  <span className="absolute bottom-1 right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--color-ink)] px-1 text-[10px] font-bold text-white">
                    {item.quantity}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-sm font-bold leading-5 text-[var(--color-ink)]">
                    {item.product.name}
                  </p>

                  <p className="mt-1 text-xs text-[var(--color-muted)]">
                    {item.product.storage} · {item.product.colour}
                  </p>

                  <span className="mt-1 inline-flex rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-muted)]">
                    {conditionLabels[item.product.condition]}
                  </span>

                  <p className="mt-2 text-sm font-bold tabular-nums">
                    {formatNaira(item.addedPrice * item.quantity)}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-5 space-y-3 border-t border-[var(--color-border)] pt-4">
            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--color-muted)]">Subtotal</span>
              <span className="font-semibold tabular-nums">
                {formatNaira(selectedSubtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 text-sm">
              <span className="text-[var(--color-muted)]">Delivery</span>
              <span className="font-semibold tabular-nums">
                {deliveryFee > 0 ? formatNaira(deliveryFee) : "Calculated next"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-[var(--color-border)] pt-4">
              <span className="font-bold">Total</span>
              <span className="text-xl font-extrabold tabular-nums">
                {formatNaira(total)}
              </span>
            </div>
          </div>
        </>
      )}

      <div className="mt-5 space-y-4 border-t border-[var(--color-border)] pt-4">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-accent)]">
            <FiShield size={17} aria-hidden="true" />
          </span>

          <div>
            <p className="text-xs font-bold">Secure payments</p>
            <p className="text-xs leading-5 text-[var(--color-muted)]">
              Payment processing and verification will be handled securely when
              Paystack is integrated.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-accent)]">
            <FiTruck size={17} aria-hidden="true" />
          </span>

          <div>
            <p className="text-xs font-bold">Nationwide delivery</p>
            <p className="text-xs leading-5 text-[var(--color-muted)]">
              Available delivery options will be shown during checkout.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-accent)]">
            <FiRotateCcw size={17} aria-hidden="true" />
          </span>

          <div>
            <p className="text-xs font-bold">Shopping with confidence</p>
            <p className="text-xs leading-5 text-[var(--color-muted)]">
              Please review the store's return policy before placing your order.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
