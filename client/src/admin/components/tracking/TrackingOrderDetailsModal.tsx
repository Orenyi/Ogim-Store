import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiUser, FiMapPin } from "react-icons/fi";
import type { TrackingOrder } from "../../types/tracking.types";
import TrackingStatusBadge from "./TrackingStatusBadge";
import TrackingTimeline from "./TrackingTimeline";

type Props = {
  order: TrackingOrder | null;
  onClose: () => void;
};

export default function TrackingOrderDetailsModal({ order, onClose }: Props) {
  useEffect(() => {
    if (!order) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [order, onClose]);

  return (
    <AnimatePresence>
      {order && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="tracking-details-title"
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className="max-h-[92dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4 shadow-[var(--shadow-dropdown)] sm:rounded-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] pb-4">
              <div>
                <p className="text-xs font-medium text-[var(--color-muted)]">
                  Tracking details
                </p>
                <h2
                  id="tracking-details-title"
                  className="mt-1 font-heading text-xl font-extrabold text-[var(--color-ink)]"
                >
                  {order.orderId}
                </h2>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close tracking details"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-stone)] hover:text-[var(--color-ink)]"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
              <div>
                <p className="text-xs text-[var(--color-muted)]">
                  Current tracking status
                </p>
                <div className="mt-2">
                  <TrackingStatusBadge status={order.status} />
                </div>
              </div>

              <div>
                <p className="text-xs text-[var(--color-muted)]">
                  Tracking number
                </p>
                <p className="mt-1 text-sm font-bold text-[var(--color-ink)]">
                  {order.trackingNumber}
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <FiUser size={17} />
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">
                    Customer
                  </h3>
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                  {order.customer.fullName}
                </p>
                <p className="mt-1 break-all text-xs text-[var(--color-muted)]">
                  {order.customer.email}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {order.customer.phoneNumber}
                </p>
              </div>

              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-4">
                <div className="flex items-center gap-2 text-[var(--color-accent)]">
                  <FiMapPin size={17} />
                  <h3 className="text-sm font-bold text-[var(--color-ink)]">
                    Delivery
                  </h3>
                </div>
                <p className="mt-3 text-sm font-semibold text-[var(--color-ink)]">
                  {order.destination}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {order.deliveryPartner}
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {order.trackingNumber}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <TrackingTimeline events={order.events} />
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
