import { useCheckout } from "../../context/CheckoutContext";
import type { DeliveryMethod } from "../../context/CheckoutContext";

import {
  FiArrowLeft,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiInfo,
  FiTruck,
} from "react-icons/fi";

interface DeliveryMethodFormProps {
  onContinue: () => void;
  onBack?: () => void;
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const deliveryIcons: Record<DeliveryMethod, typeof FiTruck> = {
  standard: FiTruck,
  express: FiClock,
  "same-day": FiCheckCircle,
};

export default function DeliveryMethodForm({
  onContinue,
  onBack,
}: DeliveryMethodFormProps) {
  const {
    deliveryOptions,
    deliveryMethod,
    setDeliveryMethod,
    selectedDeliveryOption,
  } = useCheckout();

  function handleContinue() {
    if (!selectedDeliveryOption) return;
    onContinue();
  }

  return (
    <section aria-labelledby="delivery-method-heading">
      <header className="mb-6">
        <h2
          id="delivery-method-heading"
          className="text-xl font-extrabold tracking-[-0.03em] text-[var(--color-ink)] sm:text-2xl"
        >
          Delivery method
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          Choose how you want to receive your order.
        </p>
      </header>

      <fieldset>
        <legend className="sr-only">Available delivery options</legend>

        <div className="space-y-3">
          {deliveryOptions.map((option) => {
            const isSelected = deliveryMethod === option.id;
            const Icon = deliveryIcons[option.id];

            return (
              <label
                key={option.id}
                className={[
                  "flex cursor-pointer items-center gap-3 rounded-[var(--radius-control)] border p-4 transition-colors duration-150 sm:gap-4",
                  isSelected
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]/40 ring-1 ring-[var(--color-accent)]"
                    : "border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface-muted)]",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value={option.id}
                  checked={isSelected}
                  onChange={() => setDeliveryMethod(option.id)}
                  className="sr-only"
                />

                <span
                  aria-hidden="true"
                  className={[
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                    isSelected
                      ? "bg-[var(--color-accent)] text-white"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-muted)]",
                  ].join(" ")}
                >
                  <Icon size={19} />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-[var(--color-ink)]">
                      {option.label}
                    </span>

                    {option.id === "same-day" && (
                      <span className="rounded-full bg-[var(--color-surface-muted)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-muted)]">
                        Abuja only
                      </span>
                    )}
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
                    {option.description}
                  </span>
                </span>

                <span className="shrink-0 text-right">
                  <span className="block text-sm font-extrabold tabular-nums text-[var(--color-ink)]">
                    {formatNaira(option.fee)}
                  </span>
                  {isSelected && (
                    <span className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-accent)]">
                      <FiCheckCircle size={12} aria-hidden="true" />
                      Selected
                    </span>
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-3.5">
        <FiInfo
          className="mt-0.5 shrink-0 text-blue-600"
          size={17}
          aria-hidden="true"
        />

        <p className="text-xs leading-5 text-[var(--color-muted)]">
          Delivery times are estimates and may vary depending on your location
          and order confirmation. Same-day delivery is intended for Abuja only
          and remains subject to availability.
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
          onClick={handleContinue}
          disabled={!selectedDeliveryOption}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to payment
          <FiArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
