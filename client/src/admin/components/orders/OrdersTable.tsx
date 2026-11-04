import { useState } from "react";
import { FiChevronDown } from "react-icons/fi";

import OrderStatusBadge from "./OrderStatusBadge";
import PaymentStatusBadge from "./PaymentStatusBadge";
import OrderActionsMenu from "./OrderActionsMenu";

import type {
  AdminOrder,
  OrderFulfilmentStatus,
} from "../../types/orders.types";

type Props = {
  orders: AdminOrder[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onStatusChange: (orderId: string, status: OrderFulfilmentStatus) => void;
  onCreateDispatch: (orderId: string) => void;
  onSendUpdate: (orderId: string) => void;
};

const money = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

const statusOptions: {
  value: OrderFulfilmentStatus;
  label: string;
}[] = [
  { value: "pending_dispatch", label: "Pending Dispatch" },
  { value: "processing", label: "Processing" },
  { value: "dispatched", label: "Dispatched" },
  { value: "in_transit", label: "In Transit" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersTable({
  orders,
  selectedIds,
  onSelectionChange,
  onStatusChange,
  onCreateDispatch,
  onSendUpdate,
}: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const allSelected =
    orders.length > 0 &&
    orders.every((order) => selectedIds.includes(order.id));

  function toggleAll() {
    if (allSelected) {
      onSelectionChange(
        selectedIds.filter((id) => !orders.some((order) => order.id === id)),
      );
    } else {
      onSelectionChange([
        ...new Set([...selectedIds, ...orders.map((order) => order.id)]),
      ]);
    }
  }

  function toggleOne(id: string) {
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  }

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[1050px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="w-10 px-2 py-3">
              <input
                type="checkbox"
                aria-label="Select all orders on this page"
                checked={allSelected}
                onChange={toggleAll}
                className="h-4 w-4 rounded accent-[var(--color-accent)]"
              />
            </th>
            {[
              "Order ID",
              "Customer",
              "Items",
              "Total",
              "Payment",
              "Fulfilment Status",
              "Ordered",
              "Actions",
            ].map((heading) => (
              <th
                key={heading}
                className="whitespace-nowrap px-2 py-3 text-[11px] font-bold text-[var(--color-ink)]"
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
              className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-surface-muted)]/50"
            >
              <td className="px-2 py-3">
                <input
                  type="checkbox"
                  aria-label={`Select ${order.orderNumber}`}
                  checked={selectedIds.includes(order.id)}
                  onChange={() => toggleOne(order.id)}
                  className="h-4 w-4 rounded accent-[var(--color-accent)]"
                />
              </td>

              <td className="whitespace-nowrap px-2 py-3">
                <a
                  href={`/admin/orders/${order.id}`}
                  className="text-xs font-bold text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                >
                  {order.orderNumber}
                </a>
              </td>

              <td className="px-2 py-3">
                <div className="flex min-w-[140px] items-center gap-2">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[10px] font-bold text-[var(--color-ink)]">
                    {order.customer.initials}
                  </span>
                  <span className="max-w-[125px] truncate text-xs font-medium">
                    {order.customer.fullName}
                  </span>
                </div>
              </td>

              <td className="max-w-[150px] truncate px-2 py-3 text-xs text-[var(--color-muted)]">
                {order.itemSummary}
                {order.items.length > 1 && ` +${order.items.length - 1} more`}
              </td>

              <td className="whitespace-nowrap px-2 py-3 text-xs font-bold tabular-nums">
                {money.format(order.total)}
              </td>

              <td className="px-2 py-3">
                <PaymentStatusBadge status={order.paymentStatus} />
              </td>

              <td className="px-2 py-3">
                <div className="relative w-fit">
                  {editingId === order.id ? (
                    <select
                      autoFocus
                      aria-label={`Update fulfilment status for ${order.orderNumber}`}
                      value={order.fulfilmentStatus}
                      onChange={(event) => {
                        onStatusChange(
                          order.id,
                          event.target.value as OrderFulfilmentStatus,
                        );
                        setEditingId(null);
                      }}
                      onBlur={() => setEditingId(null)}
                      className="h-9 max-w-[155px] rounded-full border border-[var(--color-accent)] bg-white px-2 text-[11px] outline-none"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setEditingId(order.id)}
                      aria-label={`Change status: ${order.fulfilmentStatus}`}
                      className="flex items-center gap-2"
                    >
                      <OrderStatusBadge status={order.fulfilmentStatus} />
                      <FiChevronDown
                        size={13}
                        className="text-[var(--color-muted)]"
                      />
                    </button>
                  )}
                </div>
              </td>

              <td className="whitespace-nowrap px-2 py-3 text-xs text-[var(--color-muted)]">
                {new Date(order.orderedAt).toLocaleDateString("en-NG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </td>

              <td className="px-2 py-3">
                <OrderActionsMenu
                  orderId={order.id}
                  onUpdateStatus={() => setEditingId(order.id)}
                  onCreateDispatch={onCreateDispatch}
                  onSendUpdate={onSendUpdate}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {orders.length === 0 && (
        <p className="py-12 text-center text-sm text-[var(--color-muted)]">
          No orders match your filters.
        </p>
      )}
    </div>
  );
}
