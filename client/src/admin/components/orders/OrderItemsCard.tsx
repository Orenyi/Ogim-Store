import { FiBox, FiImage } from "react-icons/fi";

import type { AdminOrder } from "../../types/orders.types";

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function OrderItemsCard({ order }: { order: AdminOrder }) {
  return (
    <section className="admin-order-card">
      <div className="admin-order-card-heading">
        <FiBox />
        <h2>Order Items ({order.items.length})</h2>
      </div>

      <div className="divide-y divide-[var(--color-border)]">
        {order.items.map((item) => (
          <article
            key={item.productId}
            className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0 sm:flex-nowrap"
          >
            <div className="flex h-[76px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--color-surface-muted)]">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.productName}
                  className="h-full w-full object-contain p-2"
                />
              ) : (
                <FiImage size={25} className="text-[var(--color-muted)]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-bold text-[var(--color-ink)]">
                {item.productName}
              </h3>

              <p className="mt-1 text-xs text-[var(--color-muted)]">
                {item.variant ||
                  (item.condition
                    ? item.condition.replaceAll("_", " ")
                    : "Product")}
              </p>

              <p className="mt-1 text-xs font-semibold text-[var(--color-ink)]">
                {money.format(item.unitPrice)}
              </p>
            </div>

            <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
              <span className="rounded-full bg-[var(--color-surface-muted)] px-3 py-1.5 text-xs font-semibold text-[var(--color-ink)]">
                Qty: {item.quantity}
              </span>

              <strong className="whitespace-nowrap text-sm font-extrabold text-[var(--color-ink)]">
                {money.format(item.unitPrice * item.quantity)}
              </strong>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
