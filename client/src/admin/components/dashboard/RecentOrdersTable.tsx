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

// ============================================
// STATUS BADGE
// ============================================

function OrderStatusBadge({ status }: { status: DashboardOrderStatus }) {
  const config = statusStyles[status];

  return (
    <span
      className="inline-flex max-w-full items-center justify-center whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold sm:px-3 sm:text-[11px]"
      style={{
        backgroundColor: config.background,
        color: config.color,
      }}
    >
      {config.label}
    </span>
  );
}

// ============================================
// CUSTOMER AVATAR
// ============================================

function CustomerAvatar({ initials }: { initials: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[10px] font-bold text-[var(--color-ink)]">
      {initials}
    </span>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyOrders() {
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

// ============================================
// DESKTOP TABLE
// ============================================

function DesktopOrdersTable({ orders }: RecentOrdersTableProps) {
  return (
    <div className="hidden w-full min-w-0 lg:block">
      <table className="w-full table-fixed border-collapse text-left">
        {/* Control the width of every column */}
        <colgroup>
          <col className="w-[20%]" />
          <col className="w-[21%]" />
          <col className="w-[17%]" />
          <col className="w-[13%]" />
          <col className="w-[13%]" />
          <col className="w-[11%]" />
          <col className="w-[5%]" />
        </colgroup>

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
            ].map((heading, index) => (
              <th
                key={heading || "actions"}
                className={`overflow-hidden py-3 text-[11px] font-semibold text-[var(--color-muted)] ${
                  index === 0
                    ? "pr-2 pl-0"
                    : index === 6
                      ? "pl-1 pr-0 text-right"
                      : "px-2"
                }`}
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
              {/* Order ID */}
              <td className="min-w-0 overflow-hidden py-3 pr-2 pl-0">
                <Link
                  to={`/admin/orders/${order.id}`}
                  title={order.orderNumber}
                  className="block truncate text-xs font-bold text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]"
                >
                  {order.orderNumber}
                </Link>
              </td>

              {/* Customer */}
              <td className="min-w-0 overflow-hidden px-2 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  <CustomerAvatar initials={order.customerInitials} />

                  <span
                    title={order.customerName}
                    className="min-w-0 truncate text-xs font-medium text-[var(--color-ink)]"
                  >
                    {order.customerName}
                  </span>
                </div>
              </td>

              {/* Items */}
              <td
                title={order.itemSummary}
                className="min-w-0 overflow-hidden px-2 py-3"
              >
                <span className="block truncate text-xs text-[var(--color-muted)]">
                  {order.itemSummary}
                </span>
              </td>

              {/* Total */}
              <td className="overflow-hidden px-2 py-3">
                <span
                  title={currencyFormatter.format(order.total)}
                  className="block truncate whitespace-nowrap text-xs font-semibold tabular-nums text-[var(--color-ink)]"
                >
                  {currencyFormatter.format(order.total)}
                </span>
              </td>

              {/* Status */}
              <td className="overflow-hidden px-2 py-3">
                <OrderStatusBadge status={order.status} />
              </td>

              {/* Updated */}
              <td className="overflow-hidden px-2 py-3">
                <span
                  title={order.updatedAt}
                  className="block truncate whitespace-nowrap text-xs text-[var(--color-muted)]"
                >
                  {order.updatedAt}
                </span>
              </td>

              {/* View action */}
              <td className="py-3 pl-1 pr-0 text-right">
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
  );
}

// ============================================
// RESPONSIVE ORDER CARDS
// ============================================

function MobileOrdersList({ orders }: RecentOrdersTableProps) {
  return (
    <div className="min-w-0 divide-y divide-[var(--color-border)] lg:hidden">
      {orders.map((order) => (
        <article key={order.id} className="min-w-0 py-4 first:pt-1 last:pb-1">
          {/* Customer and order information */}
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <CustomerAvatar initials={order.customerInitials} />

              <div className="min-w-0">
                <Link
                  to={`/admin/orders/${order.id}`}
                  title={order.orderNumber}
                  className="block truncate text-xs font-bold text-[var(--color-ink)] transition-colors hover:text-[var(--color-accent)]"
                >
                  {order.orderNumber}
                </Link>

                <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
                  {order.customerName}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <OrderStatusBadge status={order.status} />
            </div>
          </div>

          {/* Order details */}
          <div className="mt-3 flex min-w-0 items-end justify-between gap-3">
            <div className="min-w-0">
              <p
                title={order.itemSummary}
                className="truncate text-xs text-[var(--color-muted)]"
              >
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

          {/* View order */}
          <Link
            to={`/admin/orders/${order.id}`}
            className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-accent)] transition-colors hover:text-[var(--color-accent-hover)]"
          >
            View order
            <FiArrowUpRight size={13} />
          </Link>
        </article>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  if (orders.length === 0) {
    return <EmptyOrders />;
  }

  return (
    <div className="w-full min-w-0">
      <DesktopOrdersTable orders={orders} />

      <MobileOrdersList orders={orders} />
    </div>
  );
}
