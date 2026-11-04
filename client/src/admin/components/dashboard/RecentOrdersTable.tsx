import { Link } from "react-router-dom";
import { FiArrowUpRight, FiPackage } from "react-icons/fi";

import type {
  DashboardOrderStatus,
  RecentOrder,
} from "../../types/dashboard.types";

type RecentOrdersTableProps = {
  orders: RecentOrder[];
};

const currencyFormatter = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const statusStyles: Record<
  DashboardOrderStatus,
  { label: string; background: string; color: string }
> = {
  pending: {
    label: "Pending",
    background: "var(--color-warning-soft)",
    color: "var(--color-warning)",
  },
  processing: {
    label: "Processing",
    background: "#E8F3FF",
    color: "#1769AA",
  },
  dispatched: {
    label: "Dispatched",
    background: "#F0EAFE",
    color: "#7040C0",
  },
  in_transit: {
    label: "In Transit",
    background: "var(--color-accent-soft)",
    color: "var(--color-accent)",
  },
  delivered: {
    label: "Delivered",
    background: "var(--color-success-soft)",
    color: "var(--color-success)",
  },
  cancelled: {
    label: "Cancelled",
    background: "var(--color-error-soft)",
    color: "var(--color-error)",
  },
  refunded: {
    label: "Refunded",
    background: "var(--color-surface-muted)",
    color: "var(--color-muted)",
  },
};

function OrderStatusBadge({ status }: { status: DashboardOrderStatus }) {
  const config = statusStyles[status];

  return (
    <span
      className="inline-flex whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold"
      style={{
        backgroundColor: config.background,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

function CustomerAvatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[10px] font-bold text-[var(--color-ink)]">
      {initials}
    </span>
  );
}

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex min-h-[220px] flex-col items-center justify-center px-4 py-10 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-surface-muted)] text-[var(--color-muted)]">
          <FiPackage size={22} />
        </span>
        <h3 className="mt-3 text-sm font-bold text-[var(--color-ink)]">
          No recent orders
        </h3>
        <p className="mt-1 max-w-xs text-xs text-[var(--color-muted)]">
          New customer orders will appear here when they are placed.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop and tablet table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)]">
              {[
                "Order ID",
                "Customer",
                "Items",
                "Total",
                "Status",
                "Updated",
                "",
              ].map((heading) => (
                <th
                  key={heading || "actions"}
                  className="whitespace-nowrap px-2 py-3 text-[11px] font-semibold text-[var(--color-muted)] first:pl-0 last:pr-0"
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[var(--color-border)] last:border-0 transition-colors hover:bg-[var(--color-surface-muted)]/60"
              >
                <td className="whitespace-nowrap py-3 pr-3 pl-0">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {order.orderNumber}
                  </Link>
                </td>

                <td className="py-3 pr-3">
                  <div className="flex min-w-[125px] items-center gap-2">
                    <CustomerAvatar initials={order.customerInitials} />
                    <span className="max-w-[115px] truncate text-xs font-medium text-[var(--color-ink)]">
                      {order.customerName}
                    </span>
                  </div>
                </td>

                <td className="max-w-[140px] truncate px-2 py-3 text-xs text-[var(--color-muted)]">
                  {order.itemSummary}
                </td>

                <td className="whitespace-nowrap px-2 py-3 text-xs font-semibold tabular-nums text-[var(--color-ink)]">
                  {currencyFormatter.format(order.total)}
                </td>

                <td className="px-2 py-3">
                  <OrderStatusBadge status={order.status} />
                </td>

                <td className="whitespace-nowrap px-2 py-3 text-xs text-[var(--color-muted)]">
                  {order.updatedAt}
                </td>

                <td className="py-3 pl-2 pr-0 text-right">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    aria-label={`View ${order.orderNumber}`}
                    title="View order"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] transition-colors hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                  >
                    <FiArrowUpRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile order cards */}
      <div className="divide-y divide-[var(--color-border)] md:hidden">
        {orders.map((order) => (
          <article key={order.id} className="py-4 first:pt-1 last:pb-1">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <CustomerAvatar initials={order.customerInitials} />

                <div className="min-w-0">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="block truncate text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
                    {order.customerName}
                  </p>
                </div>
              </div>

              <OrderStatusBadge status={order.status} />
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-xs text-[var(--color-muted)]">
                  {order.itemSummary}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                  Updated {order.updatedAt}
                </p>
              </div>

              <p className="shrink-0 text-sm font-bold tabular-nums text-[var(--color-ink)]">
                {currencyFormatter.format(order.total)}
              </p>
            </div>

            <Link
              to={`/admin/orders/${order.id}`}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)]"
            >
              View order
              <FiArrowUpRight size={13} />
            </Link>
          </article>
        ))}
      </div>
    </>
  );
}
