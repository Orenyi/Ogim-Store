import {
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiShield,
  FiRefreshCw,
  FiAlertCircle,
} from "react-icons/fi";

import PaymentStatusBadge from "./PaymentStatusBadge";

import type { AdminOrder } from "../../types/orders.types";

const paymentMethodLabels: Record<string, string> = {
  paystack: "Paystack",
  bank_transfer: "Bank Transfer",
  cash_on_delivery: "Cash on Delivery",
};

function formatCurrency(amount: number, currency = "NGN"): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string | null): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLabel(value?: string): string {
  if (!value) return "Not available";

  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function PaymentInfoCard({ order }: { order: AdminOrder }) {
  const payment = order.paymentDetails;
  const refund = payment?.refund;

  const isPaid =
    order.paymentStatus === "paid" ||
    order.paymentStatus === "partially_refunded" ||
    order.paymentStatus === "refunded";

  const paymentDate =
    payment?.paidAt || payment?.verifiedAt || order.paymentDate;

  // Payment amounts are stored in kobo by the backend.
  const paymentAmount = payment ? payment.amountKobo / 100 : undefined;

  const paymentCurrency = payment?.currency || "NGN";

  const refundAmount = refund ? refund.amountKobo / 100 : 0;

  const refundCurrency = refund?.currency || paymentCurrency;

  const paymentMethod =
    paymentMethodLabels[order.paymentMethod] || order.paymentMethod;

  const verificationTitle =
    order.paymentStatus === "refunded"
      ? "Payment Refunded"
      : order.paymentStatus === "partially_refunded"
        ? "Partially Refunded"
        : isPaid
          ? "Payment Verified"
          : order.paymentStatus === "failed"
            ? "Payment Failed"
            : "Payment Not Verified";

  const verificationDescription =
    order.paymentStatus === "refunded"
      ? "The payment has been fully refunded."
      : order.paymentStatus === "partially_refunded"
        ? "A partial refund has been successfully processed."
        : isPaid
          ? "Payment confirmation has been recorded by the payment provider."
          : order.paymentStatus === "failed"
            ? "The payment attempt was unsuccessful."
            : "Payment is not currently confirmed as successful.";

  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiCreditCard />
        <h2>Payment Information</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_180px]">
        <div className="space-y-3">
          <div className="admin-order-detail-row">
            <span>Payment Method</span>
            <strong>{paymentMethod}</strong>
          </div>

          {payment?.channel && (
            <div className="admin-order-detail-row">
              <span>Payment Channel</span>
              <strong className="capitalize">{payment.channel}</strong>
            </div>
          )}

          <div className="admin-order-detail-row">
            <span>Transaction Reference</span>
            <strong className="max-w-[170px] truncate text-right">
              {order.paymentReference || "Not available"}
            </strong>
          </div>

          <div className="admin-order-detail-row">
            <span>Payment Date</span>
            <strong>{formatDate(paymentDate)}</strong>
          </div>

          {payment?.verifiedAt && (
            <div className="admin-order-detail-row">
              <span>Verification Date</span>
              <strong>{formatDate(payment.verifiedAt)}</strong>
            </div>
          )}

          {paymentAmount !== undefined && (
            <div className="admin-order-detail-row">
              <span>Payment Amount</span>
              <strong>{formatCurrency(paymentAmount, paymentCurrency)}</strong>
            </div>
          )}

          <div className="admin-order-detail-row">
            <span>Payment Status</span>
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>

          {payment?.failureReason && (
            <div className="rounded-lg border border-[var(--color-error)]/20 bg-[var(--color-error)]/5 p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--color-error)]">
                <FiAlertCircle size={14} />
                Payment Failure Reason
              </div>

              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                {payment.failureReason}
              </p>
            </div>
          )}
        </div>

        <div
          className={`flex flex-col items-center justify-center rounded-xl p-4 text-center ${
            isPaid
              ? "bg-[var(--color-success-soft)]"
              : "bg-[var(--color-surface-muted)]"
          }`}
        >
          {isPaid ? (
            <FiCheckCircle size={26} className="text-[var(--color-success)]" />
          ) : order.paymentStatus === "failed" ? (
            <FiAlertCircle size={26} className="text-[var(--color-error)]" />
          ) : (
            <FiClock size={26} className="text-[var(--color-muted)]" />
          )}

          <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">
            {verificationTitle}
          </p>

          <p className="mt-1 text-[11px] leading-4 text-[var(--color-muted)]">
            {verificationDescription}
          </p>

          {isPaid && (
            <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-success)]">
              <FiShield size={12} />
              Verified payment
            </span>
          )}
        </div>
      </div>

      {refund && refund.status !== "not_required" && (
        <div className="mt-5 space-y-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
          <div className="flex items-center gap-2">
            <FiRefreshCw size={16} className="text-[var(--color-muted)]" />

            <h3 className="text-sm font-bold text-[var(--color-ink)]">
              Refund Information
            </h3>
          </div>

          <div className="admin-order-detail-row">
            <span>Refund Status</span>
            <strong className="capitalize">{formatLabel(refund.status)}</strong>
          </div>

          {refund.amountKobo > 0 && (
            <div className="admin-order-detail-row">
              <span>Refund Amount</span>
              <strong>{formatCurrency(refundAmount, refundCurrency)}</strong>
            </div>
          )}

          {refund.reason && (
            <div>
              <p className="text-xs text-[var(--color-muted)]">Refund Reason</p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-ink)]">
                {refund.reason}
              </p>
            </div>
          )}

          {refund.failureReason && (
            <div>
              <p className="text-xs font-medium text-[var(--color-error)]">
                Refund Failure Reason
              </p>

              <p className="mt-1 text-xs leading-5 text-[var(--color-muted)]">
                {refund.failureReason}
              </p>
            </div>
          )}

          <div className="admin-order-detail-row">
            <span>Refund Requested</span>
            <strong>{formatDate(refund.requestedAt)}</strong>
          </div>

          <div className="admin-order-detail-row">
            <span>Refund Processed</span>
            <strong>{formatDate(refund.processedAt)}</strong>
          </div>

          {refund.providerId && (
            <div className="admin-order-detail-row">
              <span>Provider Refund ID</span>
              <strong className="max-w-[170px] truncate text-right">
                {refund.providerId}
              </strong>
            </div>
          )}

          {refund.attemptCount > 0 && (
            <div className="admin-order-detail-row">
              <span>Refund Attempts</span>
              <strong>{refund.attemptCount}</strong>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
