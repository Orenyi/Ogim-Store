import { FiCreditCard, FiCheckCircle, FiClock, FiShield } from "react-icons/fi";

import PaymentStatusBadge from "./PaymentStatusBadge";

import type { AdminOrder } from "../../types/orders.types";

export default function PaymentInfoCard({ order }: { order: AdminOrder }) {
  const paid = order.paymentStatus === "paid";

  const paymentMethodLabels = {
    paystack: "Paystack",
    bank_transfer: "Bank Transfer",
    cash_on_delivery: "Cash on Delivery",
  };

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
            <strong>{paymentMethodLabels[order.paymentMethod]}</strong>
          </div>

          <div className="admin-order-detail-row">
            <span>Transaction Reference</span>
            <strong className="max-w-[170px] truncate text-right">
              {order.paymentReference || "Not available"}
            </strong>
          </div>

          <div className="admin-order-detail-row">
            <span>Payment Date</span>
            <strong>
              {order.paymentDate
                ? new Date(order.paymentDate).toLocaleString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "Not available"}
            </strong>
          </div>

          <div className="admin-order-detail-row">
            <span>Payment Status</span>
            <PaymentStatusBadge status={order.paymentStatus} />
          </div>
        </div>

        <div
          className={`flex flex-col items-center justify-center rounded-xl p-4 text-center ${
            paid
              ? "bg-[var(--color-success-soft)]"
              : "bg-[var(--color-surface-muted)]"
          }`}
        >
          {paid ? (
            <FiCheckCircle size={26} className="text-[var(--color-success)]" />
          ) : (
            <FiClock size={26} className="text-[var(--color-muted)]" />
          )}

          <p className="mt-2 text-sm font-bold text-[var(--color-ink)]">
            {paid ? "Payment Verified" : "Payment Not Verified"}
          </p>

          <p className="mt-1 text-[11px] leading-4 text-[var(--color-muted)]">
            {paid
              ? "Payment confirmation has been recorded by the payment provider."
              : "Payment is not currently confirmed as successful."}
          </p>

          {paid && (
            <span className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--color-success)]">
              <FiShield size={12} />
              Verified payment
            </span>
          )}
        </div>
      </div>
    </section>
  );
}
