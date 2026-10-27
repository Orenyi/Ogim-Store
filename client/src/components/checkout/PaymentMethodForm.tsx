import {
  FiArrowLeft,
  FiArrowRight,
  FiCreditCard,
  FiShield,
} from "react-icons/fi";

import { useCart } from "../../hooks/useCart";
import { useCheckout } from "../../context/CheckoutContext";

interface PaymentMethodFormProps {
  onContinue: () => void;
  onBack?: () => void;
}

const formatNaira = (amount: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

export default function PaymentMethodForm({
  onContinue,
  onBack,
}: PaymentMethodFormProps) {
  const { selectedSubtotal, selectedItemCount, isHydrated } = useCart();
  const { deliveryFee } = useCheckout();

  const total = selectedSubtotal + deliveryFee;
  const canContinue = isHydrated && selectedItemCount > 0;

  return (
    <section aria-labelledby="payment-method-heading">
      <header className="mb-6">
        <h2
          id="payment-method-heading"
          className="text-xl font-extrabold tracking-[-0.03em] text-[var(--color-ink)] sm:text-2xl"
        >
          Payment method
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--color-muted)]">
          All payments will be securely processed through Paystack when payment
          integration is enabled.
        </p>
      </header>

      <fieldset>
        <legend className="sr-only">Choose a payment method</legend>

        <label className="flex cursor-default items-center gap-3 rounded-[var(--radius-control)] border border-[var(--color-accent)] bg-[var(--color-accent-soft)]/30 p-4 ring-1 ring-[var(--color-accent)]">
          <input
            type="radio"
            name="paymentMethod"
            value="paystack"
            checked
            readOnly
            className="sr-only"
          />

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-[var(--color-accent)]">
            <FiCreditCard size={22} aria-hidden="true" />
          </span>

          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-[var(--color-ink)]">
              Paystack
            </span>
            <span className="mt-1 block text-xs leading-5 text-[var(--color-muted)]">
              Pay securely with card, bank transfer, USSD or other supported
              payment methods.
            </span>
          </span>

          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent)] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white" />
          </span>
        </label>
      </fieldset>

      <div className="mt-6 rounded-[var(--radius-control)] border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--color-muted)]">
              Amount to pay
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-3xl">
              {formatNaira(total)}
            </p>
          </div>

          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--color-success)]">
            <FiShield size={20} aria-hidden="true" />
          </span>
        </div>

        <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4 text-sm">
          <div className="flex items-center justify-between gap-3">
            <span className="text-[var(--color-muted)]">Items subtotal</span>
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
        </div>
      </div>

      <div className="mt-4 flex items-start gap-3 rounded-[var(--radius-control)] border border-[var(--color-border)] p-3.5">
        <FiShield
          className="mt-0.5 shrink-0 text-[var(--color-success)]"
          size={18}
          aria-hidden="true"
        />
        <p className="text-xs leading-5 text-[var(--color-muted)]">
          Your payment will be handled through Paystack's supported checkout
          flow. This screen is currently a UI placeholder; no payment is
          initiated and no charge will be made here.
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
          onClick={onContinue}
          disabled={!canContinue}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-6 text-sm font-bold text-white transition-colors hover:bg-[var(--color-accent-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Continue to review
          <FiArrowRight size={17} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
