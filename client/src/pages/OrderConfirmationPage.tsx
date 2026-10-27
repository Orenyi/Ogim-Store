import { Link, useNavigate } from "react-router-dom";
import {
  FiArrowRight,
  FiCheckCircle,
  FiMapPin,
  FiPackage,
  FiShoppingBag,
  FiTruck,
} from "react-icons/fi";

import { useCart } from "../hooks/useCart";
import { useCheckout } from "../context/CheckoutContext";

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

export default function OrderConfirmationPage() {
  const navigate = useNavigate();

  const { items, selectedSubtotal, selectedItemCount, isHydrated } = useCart();

  const { contactDetails, selectedDeliveryOption, deliveryFee, resetCheckout } =
    useCheckout();

  const selectedItems = items.filter((item) => item.selected);
  const total = selectedSubtotal + deliveryFee;

  const demoOrderNumber = "DEMO-ORDER-001";

  function handleContinueShopping() {
    resetCheckout();
    navigate("/shop");
  }

  if (!isHydrated) {
    return (
      <main className="min-h-screen bg-[var(--color-paper)] py-12">
        <div className="page-container">
          <div
            role="status"
            className="mx-auto max-w-2xl animate-pulse space-y-4 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8"
          >
            <div className="h-10 w-10 rounded-full bg-[var(--color-stone)]" />
            <div className="h-6 w-56 rounded bg-[var(--color-stone)]" />
            <div className="h-4 w-full max-w-sm rounded bg-[var(--color-stone)]" />
            <div className="h-28 rounded bg-[var(--color-stone)]" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--color-paper)] py-8 sm:py-12">
      <div className="page-container">
        <div className="mx-auto max-w-2xl">
          <section className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] shadow-[var(--shadow-card)]">
            <div className="border-b border-[var(--color-border)] px-5 py-8 text-center sm:px-8 sm:py-10">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-success-soft)] text-[var(--color-success)]">
                <FiCheckCircle size={34} aria-hidden="true" />
              </span>

              <span className="mt-4 inline-flex rounded-full bg-[var(--color-warning-soft)] px-3 py-1 text-xs font-bold text-[var(--color-ink)]">
                DEMO ONLY — NOT A REAL ORDER
              </span>

              <h1 className="mt-4 text-2xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-3xl">
                Demo order confirmation
              </h1>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--color-muted)]">
                This page previews what a successful order confirmation could
                look like. No payment has been verified, and no order has been
                created by a backend.
              </p>
            </div>

            <div className="space-y-6 p-5 sm:p-8">
              <div className="rounded-[var(--radius-control)] bg-[var(--color-surface-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">
                  Demo order reference
                </p>

                <p className="mt-1 break-all text-lg font-extrabold text-[var(--color-ink)]">
                  {demoOrderNumber}
                </p>

                <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                  Sample reference for the frontend preview only.
                </p>
              </div>

              <section>
                <div className="flex items-center gap-2">
                  <FiMapPin
                    className="text-[var(--color-accent)]"
                    size={18}
                    aria-hidden="true"
                  />
                  <h2 className="font-bold text-[var(--color-ink)]">
                    Delivery details
                  </h2>
                </div>

                {contactDetails.fullName &&
                contactDetails.address &&
                contactDetails.city &&
                contactDetails.state ? (
                  <div className="mt-3 space-y-1 text-sm leading-6">
                    <p className="font-semibold text-[var(--color-ink)]">
                      {contactDetails.fullName}
                    </p>
                    <p className="break-words text-[var(--color-muted)]">
                      {contactDetails.email}
                    </p>
                    <p className="text-[var(--color-muted)]">
                      {contactDetails.phone}
                    </p>
                    <p className="text-[var(--color-muted)]">
                      {contactDetails.address}, {contactDetails.city},{" "}
                      {contactDetails.state}
                    </p>
                    {contactDetails.instructions && (
                      <p className="pt-1 text-[var(--color-muted)]">
                        <span className="font-semibold">Instructions:</span>{" "}
                        {contactDetails.instructions}
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                    No delivery details are available in the current checkout
                    session.
                  </p>
                )}
              </section>

              <section className="border-t border-[var(--color-border)] pt-5">
                <div className="flex items-center gap-2">
                  <FiTruck
                    className="text-[var(--color-accent)]"
                    size={18}
                    aria-hidden="true"
                  />
                  <h2 className="font-bold text-[var(--color-ink)]">
                    Delivery method
                  </h2>
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

              <section className="border-t border-[var(--color-border)] pt-5">
                <div className="flex items-center gap-2">
                  <FiPackage
                    className="text-[var(--color-accent)]"
                    size={18}
                    aria-hidden="true"
                  />
                  <h2 className="font-bold text-[var(--color-ink)]">
                    Items ({selectedItemCount})
                  </h2>
                </div>

                {selectedItems.length > 0 ? (
                  <ul className="mt-3 divide-y divide-[var(--color-border)]">
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
                          <p className="text-sm font-bold text-[var(--color-ink)]">
                            {item.product.name}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            {item.product.storage} · {item.product.colour}
                          </p>
                          <p className="mt-1 text-xs text-[var(--color-muted)]">
                            {conditionLabels[item.product.condition] ??
                              item.product.condition}{" "}
                            · Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="shrink-0 text-sm font-bold tabular-nums text-[var(--color-ink)]">
                          {formatNaira(item.addedPrice * item.quantity)}
                        </p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted)]">
                    The cart has no selected items. The confirmation layout is
                    being shown as a UI preview.
                  </p>
                )}
              </section>

              <section className="border-t border-[var(--color-border)] pt-5">
                <h2 className="font-bold text-[var(--color-ink)]">
                  Payment summary
                </h2>

                <div className="mt-3 space-y-3 text-sm">
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
                    <span className="font-bold text-[var(--color-ink)]">
                      Displayed total
                    </span>
                    <span className="text-xl font-extrabold tabular-nums text-[var(--color-ink)]">
                      {formatNaira(total)}
                    </span>
                  </div>

                  <p className="text-xs leading-5 text-[var(--color-muted)]">
                    This is a calculated preview total, not an amount paid.
                  </p>
                </div>
              </section>

              <div className="rounded-[var(--radius-control)] border border-[var(--color-border)] p-4">
                <p className="text-sm font-bold text-[var(--color-ink)]">
                  What happens next?
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted)]">
                  Once the backend and Paystack integration are ready, this page
                  can display a real order number, verified payment status, and
                  delivery updates.
                </p>
              </div>

              <div className="flex flex-col gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleContinueShopping}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2"
                >
                  <FiShoppingBag size={17} aria-hidden="true" />
                  Continue shopping
                  <FiArrowRight size={17} aria-hidden="true" />
                </button>

                <Link
                  to="/account/orders"
                  className="inline-flex min-h-11 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
                >
                  View my orders
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
