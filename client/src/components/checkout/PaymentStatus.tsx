import {
  FiCheck,
  FiCheckCircle,
  FiClock,
  FiRefreshCw,
  FiShoppingBag,
  FiX,
} from "react-icons/fi";

export type PaymentStatusType = "processing" | "failed" | "success";

interface PaymentStatusProps {
  status: PaymentStatusType;
  orderNumber?: string;
  onRetry?: () => void;
  onChangePaymentMethod?: () => void;
  onBackToCheckout?: () => void;
  onViewOrder?: () => void;
  onContinueShopping?: () => void;
}

export default function PaymentStatus({
  status,
  orderNumber,
  onRetry,
  onChangePaymentMethod,
  onBackToCheckout,
  onViewOrder,
  onContinueShopping,
}: PaymentStatusProps) {
  const isProcessing = status === "processing";
  const isFailed = status === "failed";
  const isSuccess = status === "success";

  return (
    <section
      aria-labelledby="payment-status-heading"
      aria-live={isProcessing ? "polite" : "assertive"}
      className="mx-auto flex w-full max-w-md flex-col items-center px-4 py-8 text-center sm:py-12"
    >
      <div
        className={[
          "mb-5 flex h-20 w-20 items-center justify-center rounded-full",
          isProcessing
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent)]"
            : isFailed
              ? "bg-[var(--color-error-soft)] text-[var(--color-error)]"
              : "bg-[var(--color-success-soft)] text-[var(--color-success)]",
        ].join(" ")}
      >
        {isProcessing && <FiClock size={36} aria-hidden="true" />}
        {isFailed && <FiX size={40} aria-hidden="true" />}
        {isSuccess && <FiCheck size={40} aria-hidden="true" />}
      </div>

      <h1
        id="payment-status-heading"
        className="text-2xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)] sm:text-3xl"
      >
        {isProcessing
          ? "Processing your payment"
          : isFailed
            ? "Payment failed"
            : "Demo order confirmed!"}
      </h1>

      <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted)]">
        {isProcessing
          ? "This is a payment-processing UI preview. No real payment is being processed."
          : isFailed
            ? "This is a demonstration of the payment failure screen. No real payment was attempted."
            : "This is a demo confirmation for your storefront preview. No real payment has been verified and no order has been placed."}
      </p>

      {isProcessing && (
        <div className="mt-8 w-full rounded-[var(--radius-card)] border border-[var(--color-border)] p-5 text-left">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
              <FiRefreshCw
                className="animate-spin"
                size={16}
                aria-hidden="true"
              />
            </span>
            <div>
              <p className="text-sm font-bold text-[var(--color-ink)]">
                Payment integration pending
              </p>
              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                Connect Paystack and backend verification before showing a real
                payment status.
              </p>
            </div>
          </div>
        </div>
      )}

      {isFailed && (
        <div className="mt-7 w-full rounded-[var(--radius-control)] border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] p-4 text-left">
          <h2 className="text-sm font-bold text-[var(--color-ink)]">
            Example reasons for a failed payment
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[var(--color-muted)]">
            <li>• Insufficient funds</li>
            <li>• Bank declined the transaction</li>
            <li>• Network or payment-provider issue</li>
          </ul>
        </div>
      )}

      {isSuccess && (
        <div className="mt-7 w-full rounded-[var(--radius-control)] border border-[var(--color-success)]/20 bg-[var(--color-success-soft)] p-4 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-success)]">
            Demo reference
          </p>
          <p className="mt-1 break-all text-base font-extrabold text-[var(--color-ink)]">
            {orderNumber || "DEMO-ORDER-001"}
          </p>
          <p className="mt-2 text-xs leading-5 text-[var(--color-muted)]">
            This reference is for the UI preview only. It is not proof of a
            payment or a real order.
          </p>
        </div>
      )}

      <div className="mt-7 flex w-full flex-col gap-3">
        {isProcessing && onBackToCheckout && (
          <button
            type="button"
            onClick={onBackToCheckout}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
          >
            Return to checkout
          </button>
        )}

        {isFailed && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
          >
            <FiRefreshCw size={16} aria-hidden="true" />
            Try again
          </button>
        )}

        {isFailed && onChangePaymentMethod && (
          <button
            type="button"
            onClick={onChangePaymentMethod}
            className="inline-flex min-h-12 items-center justify-center rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
          >
            Change payment method
          </button>
        )}

        {isFailed && onBackToCheckout && (
          <button
            type="button"
            onClick={onBackToCheckout}
            className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)]"
          >
            Return to checkout
          </button>
        )}

        {isSuccess && onViewOrder && (
          <button
            type="button"
            onClick={onViewOrder}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-sm font-bold text-white hover:bg-[var(--color-accent-hover)]"
          >
            <FiShoppingBag size={16} aria-hidden="true" />
            View order details
          </button>
        )}

        {isSuccess && onContinueShopping && (
          <button
            type="button"
            onClick={onContinueShopping}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-sm font-bold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
          >
            <FiCheckCircle size={16} aria-hidden="true" />
            Continue shopping
          </button>
        )}
      </div>
    </section>
  );
}
