import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiCheck, FiX } from "react-icons/fi";

import type {
  AdminOrder,
  OrderFulfilmentStatus,
} from "../../types/orders.types";

type Props = {
  order: AdminOrder | null;
  onClose: () => void;
  onSave: (status: OrderFulfilmentStatus) => void;
};

const options: {
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

export default function OrderStatusModal({ order, onClose, onSave }: Props) {
  const [status, setStatus] = useState<OrderFulfilmentStatus>("processing");

  useEffect(() => {
    if (order) setStatus(order.fulfilmentStatus);
  }, [order]);

  useEffect(() => {
    if (!order) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [order, onClose]);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center bg-[var(--color-ink)]/55 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-status-modal-title"
            className="w-full max-w-md rounded-[var(--radius-card)] bg-white p-5 shadow-[var(--shadow-dropdown)] sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2
                  id="order-status-modal-title"
                  className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                >
                  Update Fulfilment Status
                </h2>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {order.orderNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close status dialog"
                className="rounded-lg p-2 text-[var(--color-muted)] hover:bg-[var(--color-surface-muted)]"
              >
                <FiX size={18} />
              </button>
            </div>

            <label
              htmlFor="detail-order-status"
              className="mb-2 mt-6 block text-xs font-semibold text-[var(--color-ink)]"
            >
              Select new status
            </label>

            <select
              id="detail-order-status"
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as OrderFulfilmentStatus)
              }
              className="h-12 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
            >
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <p className="mt-3 text-xs leading-5 text-[var(--color-muted)]">
              This changes the order's fulfilment status only. Payment
              verification remains controlled by the payment system.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-sm font-semibold text-[var(--color-ink)] hover:bg-[var(--color-surface-muted)]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => onSave(status)}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-sm font-semibold text-white hover:bg-[var(--color-accent-hover)]"
              >
                <FiCheck size={16} />
                Save Status
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
