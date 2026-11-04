import { Link } from "react-router-dom";
import { FiArrowUpRight } from "react-icons/fi";

import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import OrderActionsMenu from "./OrderActionsMenu";

import type {
  AdminOrder,
  OrderFulfilmentStatus,
} from "../../types/orders.types";

type Props = {
  orders: AdminOrder[];
  onUpdateStatus: (orderId: string) => void;
  onStatusChange: (orderId: string, status: OrderFulfilmentStatus) => void;
  onCreateDispatch: (orderId: string) => void;
  onSendUpdate: (orderId: string) => void;
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function OrdersMobileList({
  orders,
  onStatusChange,
  onCreateDispatch,
  onSendUpdate,
}: Props) {
  return (
    <div className="space-y-3 md:hidden">
      {orders.length === 0 ? (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-4 py-12 text-center">
          <p className="text-sm font-semibold">No orders found</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        orders.map((order) => (
          <article
            key={order.id}
            className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)]"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-xs font-bold text-[var(--color-ink)]">
                  {order.customer.initials}
                </span>

                <div className="min-w-0">
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="block truncate text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {order.orderNumber}
                  </Link>
                  <p className="mt-0.5 truncate text-xs text-[var(--color-muted)]">
                    {order.customer.fullName}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <span className="text-xs font-bold tabular-nums">
                  {money.format(order.total)}
                </span>

                <OrderActionsMenu
                  orderId={order.id}
                  onUpdateStatus={() => {
                    const nextStatus = window.prompt(
                      "Enter a status: pending_dispatch, processing, dispatched, in_transit, delivered or cancelled",
                    );

                    const allowed: OrderFulfilmentStatus[] = [
                      "pending_dispatch",
                      "processing",
                      "dispatched",
                      "in_transit",
                      "delivered",
                      "cancelled",
                    ];

                    if (
                      nextStatus &&
                      allowed.includes(nextStatus as OrderFulfilmentStatus)
                    ) {
                      onStatusChange(
                        order.id,
                        nextStatus as OrderFulfilmentStatus,
                      );
                    }
                  }}
                  onCreateDispatch={onCreateDispatch}
                  onSendUpdate={onSendUpdate}
                />
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <PaymentStatusBadge status={order.paymentStatus} />
              <OrderStatusBadge status={order.fulfilmentStatus} />
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-[var(--color-border)] pt-3">
              <p className="min-w-0 truncate text-[11px] text-[var(--color-muted)]">
                {order.itemSummary}
              </p>

              <Link
                to={`/admin/orders/${order.id}`}
                className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--color-accent)]"
              >
                Details
                <FiArrowUpRight size={14} />
              </Link>
            </div>
          </article>
        ))
      )}
    </div>
  );
}
