import { FiLayers } from "react-icons/fi";

import type { AdminOrder } from "../../types/orders.types";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function OrderTotalCard({ order }: { order: AdminOrder }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiLayers />
        <h2>Order Total</h2>
      </div>

      <div className="space-y-3">
        <div className="admin-order-detail-row">
          <span>Subtotal</span>
          <strong>{money.format(order.subtotal)}</strong>
        </div>

        <div className="admin-order-detail-row">
          <span>Delivery Fee</span>
          <strong>{money.format(order.deliveryFee)}</strong>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
          <span className="text-sm font-extrabold text-[var(--color-ink)]">
            Total
          </span>
          <strong className="font-heading text-xl font-extrabold tracking-[-0.04em] text-[var(--color-ink)]">
            {money.format(order.total)}
          </strong>
        </div>
      </div>
    </section>
  );
}
