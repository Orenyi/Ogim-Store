import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiTruck, FiX } from "react-icons/fi";

import type {
  AssignDispatchInput,
  DispatchOrder,
  DeliveryPartner,
} from "../../types/dispatch.types";

type Props = {
  open: boolean;
  orders: DispatchOrder[];
  selectedOrder?: DispatchOrder | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: AssignDispatchInput) => Promise<void>;
};

const partners: DeliveryPartner[] = [
  "GIGL Logistics",
  "Sendbox",
  "Ogim Delivery",
  "DHL",
  "Other",
];

export default function AssignDispatchModal({
  open,
  orders,
  selectedOrder,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [orderId, setOrderId] = useState("");
  const [partner, setPartner] = useState<DeliveryPartner>("GIGL Logistics");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      setOrderId("");
      setPartner("GIGL Logistics");
      setTrackingNumber("");
      setEstimatedDelivery("");
      setError("");
      return;
    }

    setOrderId(selectedOrder?.id ?? orders[0]?.id ?? "");
  }, [open, selectedOrder, orders]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, saving, onClose]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!orderId) {
      setError("Select an order to assign.");
      return;
    }

    if (!trackingNumber.trim()) {
      setError("Enter the delivery tracking number.");
      return;
    }

    if (!estimatedDelivery) {
      setError("Select an estimated delivery date.");
      return;
    }

    try {
      await onSubmit({
        orderId,
        deliveryPartner: partner,
        trackingNumber: trackingNumber.trim(),
        estimatedDelivery: new Date(
          `${estimatedDelivery}T12:00:00`,
        ).toISOString(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to assign dispatch.",
      );
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center bg-[var(--color-ink)]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="assign-dispatch-title"
            className="w-full max-w-lg overflow-hidden rounded-t-[24px] bg-white shadow-[var(--shadow-dropdown)] sm:rounded-[var(--radius-card)]"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <FiTruck size={19} />
                </span>
                <div>
                  <h2
                    id="assign-dispatch-title"
                    className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                  >
                    Assign Dispatch
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    Assign an order to a delivery partner.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)]"
              >
                <FiX size={18} />
              </button>
            </div>

            <form onSubmit={(event) => void handleSubmit(event)}>
              <div className="space-y-4 p-5">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">
                    Order
                  </span>
                  <select
                    value={orderId}
                    onChange={(event) => setOrderId(event.target.value)}
                    disabled={Boolean(selectedOrder)}
                    className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)] disabled:bg-[var(--color-surface-muted)]"
                  >
                    {orders.map((order) => (
                      <option key={order.id} value={order.id}>
                        {order.orderNumber} — {order.customer.fullName}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">
                    Delivery partner
                  </span>
                  <select
                    value={partner}
                    onChange={(event) =>
                      setPartner(event.target.value as DeliveryPartner)
                    }
                    className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                  >
                    {partners.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">
                    Tracking number
                  </span>
                  <input
                    value={trackingNumber}
                    onChange={(event) => setTrackingNumber(event.target.value)}
                    placeholder="e.g. GGL7932456"
                    className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </label>

                <label className="block">
                  <span className="mb-1.5 block text-xs font-semibold">
                    Estimated delivery date
                  </span>
                  <input
                    type="date"
                    min={new Date().toISOString().slice(0, 10)}
                    value={estimatedDelivery}
                    onChange={(event) =>
                      setEstimatedDelivery(event.target.value)
                    }
                    className="h-11 w-full rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-3 text-sm outline-none focus:border-[var(--color-accent)]"
                  />
                </label>

                {error && (
                  <p
                    role="alert"
                    className="rounded-xl bg-[var(--color-error-soft)] p-3 text-xs text-[var(--color-error)]"
                  >
                    {error}
                  </p>
                )}
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] px-5 text-xs font-bold text-[var(--color-ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || orders.length === 0}
                  className="h-11 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-xs font-bold text-white hover:bg-[var(--color-accent-hover)] disabled:opacity-50"
                >
                  {saving ? "Assigning..." : "Confirm Dispatch"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
