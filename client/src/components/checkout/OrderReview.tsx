import {
  FiArrowLeft,
  FiCheckCircle,
  FiEdit2,
  FiMapPin,
  FiPackage,
  FiTruck,
} from "react-icons/fi";

import { useCart } from "../../hooks/useCart";
import { useCheckout } from "../../context/CheckoutContext";

interface OrderReviewProps {
  onPlaceOrder: () => void;
  onEditContact: () => void;
  onEditDelivery: () => void;
  onBack?: () => void;
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const conditionLabels: Record<string, string> = {
  new: "Brand new",
  "uk-used": "UK used",
  refurbished: "Refurbished",
};

export default function OrderReview({
  onPlaceOrder,
  onEditContact,
  onEditDelivery,
  onBack,
}: OrderReviewProps) {
  const { items, selectedSubtotal, selectedItemCount, isHydrated } = useCart();

  const { contactDetails, selectedDeliveryOption, deliveryFee } = useCheckout();

  const selectedItems = items.filter((item) => item.selected);
  const total = selectedSubtotal + deliveryFee;

  const { fullName, email, phone, state, city, address, instructions } =
    contactDetails;

  const hasContactDetails =
    Boolean(fullName.trim()) &&
    Boolean(email.trim()) &&
    Boolean(phone.trim()) &&
    Boolean(state.trim()) &&
    Boolean(city.trim()) &&
    Boolean(address.trim());

  const canPlaceOrder =
    isHydrated &&
    selectedItemCount > 0 &&
    selectedItems.length > 0 &&
    hasContactDetails &&
    Boolean(selectedDeliveryOption);

  if (!isHydrated) {
    return (
      <div
        aria-label="Loading order review"
        className="animate-pulse space-y-4"
      >
        <div className="h-6 w-48 rounded bg-[var(--color-stone)]" />
        <div className="h-28 rounded-[var(--radius-control)] bg-[var(--color-stone)]" />
        <div className="h-28 rounded-[var(--radius-control)] bg-[var(--color-stone)]" />
      </div>
    );
  }

  return (
    <section aria-labelledby="order-review-heading">
      <header className="mb-6">
        <h2
          id="order-review-heading"
          className="text-xl font-extrabold tracking-[-0.03em] text-[var(--color-ink)] sm:text-2xl"
        >
          Review your order
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          Check your details before proceeding.
        </p>
      </header>

      {!canPlaceOrder && (
        <div
          role="status"
          className="mb-5 rounded-[var(--radius-control)] border border-[var(--color-warning)] bg-[var(--color-warning-soft)] p-3 text-sm leading-5 text-[var(--color-ink)]"
        >
          {selectedItems.length === 0
            ? "Your cart has no selected items. Return to your cart and select the items you want to purchase."
            : !hasContactDetails
              ? "Please complete your contact details and delivery address before proceeding."
              : "Please select a delivery method before proceeding."}
        </div>
      )}

      <div className="space-y-5">
        <section className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiMapPin
                className="shrink-0 text-[var(--color-accent)]"
                size={18}
                aria-hidden="true"
              />
              <h3 className="font-bold text-[var(--color-ink)]">
                Contact & delivery address
              </h3>
            </div>

            <button
              type="button"
              onClick={onEditContact}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <FiEdit2 size={13} aria-hidden="true" />
              Edit
            </button>
          </div>

          {hasContactDetails ? (
            <div className="mt-4 space-y-3 text-sm">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">
                  {fullName}
                </p>
                <p className="mt-1 break-words text-[var(--color-muted)]">
                  {email}
                </p>
                <p className="mt-1 text-[var(--color-muted)]">{phone}</p>
              </div>

              <div className="border-t border-[var(--color-border)] pt-3">
                <p className="leading-6 text-[var(--color-ink)]">
                  {address}
                  <br />
                  {city}, {state}
                </p>

                {instructions && (
                  <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
                    <span className="font-semibold">
                      Delivery instructions:
                    </span>{" "}
                    {instructions}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              Your contact details and delivery address are incomplete.
            </p>
          )}
        </section>

        <section className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <FiTruck
                className="shrink-0 text-[var(--color-accent)]"
                size={18}
                aria-hidden="true"
              />
              <h3 className="font-bold text-[var(--color-ink)]">
                Delivery method
              </h3>
            </div>

            <button
              type="button"
              onClick={onEditDelivery}
              className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            >
              <FiEdit2 size={13} aria-hidden="true" />
              Edit
            </button>
          </div>

          {selectedDeliveryOption ? (
            <div className="mt-3 flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-semibold text-[var(--color-ink)]">
                  {selectedDeliveryOption.label}
                </p>
                <p className="mt-1 text-[var(--color-muted)]">
                  {selectedDeliveryOption.description}
                </p>
              </div>

              <p className="shrink-0 font-bold tabular-nums text-[var(--color-ink)]">
                {formatNaira(deliveryFee)}
              </p>
            </div>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              No delivery method selected.
            </p>
          )}
        </section>

        <section className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-4">
          <div className="flex items-center gap-2">
            <FiPackage
              className="text-[var(--color-accent)]"
              size={18}
              aria-hidden="true"
            />
            <h3 className="font-bold text-[var(--color-ink)]">
              Items ({selectedItemCount})
            </h3>
          </div>

          {selectedItems.length > 0 ? (
            <ul className="mt-4 divide-y divide-[var(--color-border)]">
              {selectedItems.map((item) => (
                <li
                  key={item.product.id}
                  className="flex gap-3 py-4 first:pt-0 last:pb-0"
                >
                  <div className="h-[76px] w-[68px] shrink-0 overflow-hidden rounded-[var(--radius-control)] bg-[var(--color-surface-muted)]">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      loading="lazy"
                      className="h-full w-full object-contain p-1"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-bold leading-5 text-[var(--color-ink)]">
                      {item.product.name}
                    </p>

                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {item.product.storage} · {item.product.colour}
                    </p>

                    <span className="mt-1 inline-flex rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-muted)]">
                      {conditionLabels[item.product.condition] ??
                        item.product.condition}
                    </span>

                    <p className="mt-2 text-xs text-[var(--color-muted)]">
                      Qty: {item.quantity}
                    </p>
                  </div>

                  <p className="shrink-0 text-sm font-bold tabular-nums text-[var(--color-ink)]">
                    {formatNaira(item.addedPrice * item.quantity)}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-[var(--color-muted)]">
              No items selected.
            </p>
          )}
        </section>

        <section
          aria-label="Order total"
          className="rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-4"
        >
          <h3 className="font-bold text-[var(--color-ink)]">Order summary</h3>

          <div className="mt-4 space-y-3 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--color-muted)]">Subtotal</span>
              <span className="font-semibold tabular-nums text-[var(--color-ink)]">
                {formatNaira(selectedSubtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-[var(--color-muted)]">Delivery</span>
              <span className="font-semibold tabular-nums text-[var(--color-ink)]">
                {formatNaira(deliveryFee)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-4">
              <span className="font-bold text-[var(--color-ink)]">Total</span>
              <span className="text-xl font-extrabold tabular-nums text-[var(--color-ink)]">
                {formatNaira(total)}
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] p-3.5">
        <FiCheckCircle
          className="mt-0.5 shrink-0 text-[var(--color-success)]"
          size={18}
          aria-hidden="true"
        />
        <p className="text-xs leading-5 text-[var(--color-muted)]">
          Review your details carefully. Your order will not be confirmed and no
          payment will be taken until the payment integration is implemented.
        </p>
      </div>

      <div className="mt-7 flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-5 sm:flex-row sm:justify-between">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] px-5 text-sm font-bold text-[var(--color-ink)] transition-colors hover:bg-[var(--color-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
          >
            <FiArrowLeft size={16} aria-hidden="true" />
            Back
          </button>
        ) : (
          <span />
        )}

        <button
          type="button"
          onClick={onPlaceOrder}
          disabled={!canPlaceOrder}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Review complete
        </button>
      </div>
    </section>
  );
}
