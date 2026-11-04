import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiMoreHorizontal, FiEye, FiTruck, FiCopy } from "react-icons/fi";
import type { TrackingOrder } from "../../types/tracking.types";
import TrackingStatusBadge from "./TrackingStatusBadge";
import { formatTrackingRelativeDate } from "../../utils/tracking.utils";

type Props = {
  orders: TrackingOrder[];
  loading: boolean;
  onSelect: (order: TrackingOrder) => void;
  onUpdate: (order: TrackingOrder) => void;
};

function OrderActions({
  order,
  onView,
  onUpdate,
}: {
  order: TrackingOrder;
  onView: () => void;
  onUpdate: () => void;
}) {
  const [open, setOpen] = useState(false);

  const actions = [
    { label: "View Details", icon: FiEye, action: onView },
    { label: "Update Tracking", icon: FiTruck, action: onUpdate },
    {
      label: "Copy Tracking No.",
      icon: FiCopy,
      action: () => {
        if (navigator.clipboard?.writeText) {
          void navigator.clipboard.writeText(order.trackingNumber);
        }
      },
    },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Actions for ${order.orderId}`}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-stone)] hover:text-[var(--color-ink)]"
      >
        <FiMoreHorizontal size={20} />
      </button>

      <AnimatePresence>
        {open && (
          <>
            <button
              type="button"
              aria-label="Close order actions"
              className="fixed inset-0 z-20 cursor-default"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute right-0 top-10 z-30 w-48 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-1.5 shadow-[var(--shadow-dropdown)]"
            >
              {actions.map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => {
                      setOpen(false);
                      item.action();
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[var(--color-ink)] transition hover:bg-[var(--color-surface-muted)]"
                  >
                    <Icon size={16} />
                    {item.label}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TrackingOrderCard({
  order,
  onSelect,
  onUpdate,
}: {
  order: TrackingOrder;
  onSelect: () => void;
  onUpdate: () => void;
}) {
  return (
    <article className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiTruck size={18} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onSelect}
              className="truncate text-sm font-extrabold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
            >
              {order.orderId}
            </button>
            <TrackingStatusBadge status={order.status} />
          </div>

          <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
            {order.customer.fullName} · {order.trackingNumber}
          </p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            {order.deliveryPartner} · {order.destination}
          </p>

          <div className="mt-3 flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--color-muted)]">
              {formatTrackingRelativeDate(order.lastUpdatedAt)}
            </span>
            <button
              type="button"
              onClick={onUpdate}
              className="text-xs font-bold text-[var(--color-accent)]"
            >
              Update tracking
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default function TrackingOrdersTable({
  orders,
  loading,
  onSelect,
  onUpdate,
}: Props) {
  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-14 animate-pulse rounded-xl bg-[var(--color-stone)]"
          />
        ))}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <div className="px-5 py-16 text-center">
        <FiTruck size={26} className="mx-auto text-[var(--color-muted)]" />
        <h3 className="mt-3 font-heading font-bold text-[var(--color-ink)]">
          No tracking orders found
        </h3>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Try another search term or filter.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[850px] text-left">
          <thead>
            <tr className="border-b border-[var(--color-border)] text-xs font-semibold text-[var(--color-muted)]">
              <th className="px-5 py-4">Order ID</th>
              <th className="px-4 py-4">Customer</th>
              <th className="px-4 py-4">Tracking No.</th>
              <th className="px-4 py-4">Delivery Partner</th>
              <th className="px-4 py-4">Status</th>
              <th className="px-4 py-4">Last Update</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-[var(--color-border)] last:border-0 transition hover:bg-[var(--color-surface-muted)]/60"
              >
                <td className="px-5 py-4">
                  <button
                    type="button"
                    onClick={() => onSelect(order)}
                    className="text-sm font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {order.orderId}
                  </button>
                </td>

                <td className="px-4 py-4">
                  <p className="text-sm font-medium text-[var(--color-ink)]">
                    {order.customer.fullName}
                  </p>
                </td>

                <td className="px-4 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (navigator.clipboard?.writeText) {
                        void navigator.clipboard.writeText(
                          order.trackingNumber,
                        );
                      }
                    }}
                    className="inline-flex items-center gap-2 text-sm text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                    title="Copy tracking number"
                  >
                    {order.trackingNumber}
                    <FiCopy size={14} />
                  </button>
                </td>

                <td className="px-4 py-4 text-sm text-[var(--color-ink)]">
                  <span className="inline-flex items-center gap-2">
                    <FiTruck className="text-[var(--color-accent)]" />
                    {order.deliveryPartner}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <TrackingStatusBadge status={order.status} />
                </td>

                <td className="px-4 py-4 text-sm text-[var(--color-muted)]">
                  {formatTrackingRelativeDate(order.lastUpdatedAt)}
                </td>

                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end">
                    <OrderActions
                      order={order}
                      onView={() => onSelect(order)}
                      onUpdate={() => onUpdate(order)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile order cards */}
      <div className="grid gap-3 p-3 md:hidden">
        {orders.map((order) => (
          <TrackingOrderCard
            key={order.id}
            order={order}
            onSelect={() => onSelect(order)}
            onUpdate={() => onUpdate(order)}
          />
        ))}
      </div>
    </>
  );
}
