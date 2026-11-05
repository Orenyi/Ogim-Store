import { FiArrowRight, FiShoppingBag } from "react-icons/fi";
import type { RevenueOrder } from "../../types/revenue.types";

type Props = {
  orders: RevenueOrder[];
  onViewAll?: () => void;
};

const formatNaira = (amount: number) =>
  `₦${new Intl.NumberFormat("en-NG").format(amount)}`;

const statusStyles: Record<RevenueOrder["status"], string> = {
  processing: "bg-amber-100 text-amber-800",
  dispatched: "bg-blue-100 text-blue-700",
  "in-transit": "bg-blue-100 text-blue-700",
  delivered: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  cancelled: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
};

const statusLabels: Record<RevenueOrder["status"], string> = {
  processing: "Processing",
  dispatched: "Dispatched",
  "in-transit": "In Transit",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function RecentRevenueOrders({ orders, onViewAll }: Props) {
  return (
    <section className="min-w-0 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiShoppingBag size={19} />
        </span>
        <div>
          <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
            Recent Orders
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Latest customer orders and their status.
          </p>
        </div>
      </div>

      {orders.length ? (
        <div className="mt-4">
          <div className="hidden grid-cols-[minmax(0,1fr)_minmax(90px,0.8fr)_100px_90px] gap-3 border-b border-[var(--color-border)] pb-2 text-xs font-bold text-[var(--color-muted)] sm:grid">
            <span>Order ID</span>
            <span>Customer</span>
            <span>Total</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-[var(--color-border)]">
            {orders.slice(0, 5).map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-3 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(90px,0.8fr)_100px_90px]"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--color-ink)]">
                    {order.orderNumber}
                  </p>
                  <p className="mt-1 text-[11px] text-[var(--color-muted)] sm:hidden">
                    {order.customerName}
                  </p>
                </div>

                <span className="hidden truncate text-xs text-[var(--color-ink)] sm:block">
                  {order.customerName}
                </span>

                <span className="text-xs font-bold text-[var(--color-ink)]">
                  {formatNaira(order.total)}
                </span>

                <span
                  className={`rounded-full px-2.5 py-1 text-center text-[10px] font-semibold ${statusStyles[order.status]}`}
                >
                  {statusLabels[order.status]}
                </span>
              </div>
            ))}
          </div>

          {onViewAll && (
            <button
              type="button"
              onClick={onViewAll}
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-accent)] hover:underline"
            >
              View All Orders
              <FiArrowRight size={14} />
            </button>
          )}
        </div>
      ) : (
        <p className="py-12 text-center text-sm text-[var(--color-muted)]">
          No recent orders available for this period.
        </p>
      )}
    </section>
  );
}
