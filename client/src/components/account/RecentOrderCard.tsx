import { Link } from "react-router-dom";
import { FiChevronRight, FiSmartphone } from "react-icons/fi";

import {
  formatNaira,
  getOrderItemCount,
  getOrderTotal,
  type CustomerOrder,
  type OrderStatus,
} from "../../data/orders";

type RecentOrderCardProps = {
  order: CustomerOrder;
  compact?: boolean;
};

const statusClasses: Record<OrderStatus, string> = {
  Delivered: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  Processing: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  Shipped: "bg-sky-100 text-sky-700",
  Cancelled: "bg-[var(--color-stone)] text-[var(--color-muted)]",
};

export default function RecentOrderCard({
  order,
  compact = false,
}: RecentOrderCardProps) {
  const itemCount = getOrderItemCount(order);

  return (
    <article className="overflow-hidden rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] transition-colors hover:border-[var(--color-border-strong)]">
      <Link
        to={`/account/orders/${order.id}`}
        aria-label={`View order ${order.id}`}
        className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-bold text-[var(--color-ink)] sm:text-sm">
            {order.id}
          </p>

          <p className="mt-1 text-[11px] text-[var(--color-muted)] sm:text-xs">
            {order.date}
          </p>
        </div>

        <div
          className="flex shrink-0 -space-x-2"
          aria-label={`${itemCount} items`}
        >
          {order.items.slice(0, compact ? 2 : 3).map((item, index) => (
            <div
              key={item.id}
              title={item.name}
              className={`grid h-10 w-9 place-items-center rounded-lg border-2 border-[var(--color-white)] ${
                index % 2 === 0
                  ? "bg-[var(--color-paper)]"
                  : "bg-[var(--color-stone)]"
              }`}
            >
              <FiSmartphone
                size={21}
                className="text-[var(--color-ink)]"
                aria-hidden="true"
              />
            </div>
          ))}
        </div>

        <div className="hidden min-w-[84px] sm:block">
          <p className="text-xs text-[var(--color-muted)]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>

          <p className="mt-1 whitespace-nowrap text-xs font-bold text-[var(--color-ink)]">
            {formatNaira(getOrderTotal(order))}
          </p>
        </div>

        <span
          className={`hidden shrink-0 rounded-md px-2.5 py-1.5 text-[11px] font-semibold sm:inline-flex ${statusClasses[order.status]}`}
        >
          {order.status}
        </span>

        <FiChevronRight
          size={17}
          className="shrink-0 text-[var(--color-muted)]"
          aria-hidden="true"
        />
      </Link>

      <div className="flex items-center justify-between gap-3 border-t border-[var(--color-border)] px-3 py-2.5 sm:hidden">
        <div>
          <p className="text-[11px] text-[var(--color-muted)]">
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </p>

          <p className="mt-0.5 text-xs font-bold text-[var(--color-ink)]">
            {formatNaira(getOrderTotal(order))}
          </p>
        </div>

        <span
          className={`rounded-md px-2 py-1 text-[10px] font-semibold ${statusClasses[order.status]}`}
        >
          {order.status}
        </span>
      </div>
    </article>
  );
}
