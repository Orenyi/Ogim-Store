import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  FiAlertCircle,
  FiArrowRight,
  FiCheckCircle,
  FiTruck,
  FiX,
} from "react-icons/fi";
import { createPortal } from "react-dom";

import type { DispatchOrder, DispatchStatus } from "../../types/dispatch.types";
import { getDispatchStatusLabel } from "../../utils/dispatch.utils";

type Props = {
  open: boolean;
  dispatch: DispatchOrder | null;
  nextStatus: DispatchStatus | null;
  saving: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

const statusStyles: Record<DispatchStatus, string> = {
  pending: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  dispatched: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  in_transit: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  delivered: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
};

export default function UpdateDispatchStatusModal({
  open,
  dispatch,
  nextStatus,
  saving,
  onClose,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open, saving, onClose]);

  if (!dispatch || !nextStatus) return null;

  const isDelivered = nextStatus === "delivered";

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[var(--z-modal)] flex items-end justify-center bg-[var(--color-ink)]/55 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              onClose();
            }
          }}
        >
          <motion.section
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-dispatch-title"
            className="w-full max-w-md overflow-hidden rounded-t-[24px] border border-[var(--color-border)] bg-white shadow-[var(--shadow-dropdown)] sm:rounded-[var(--radius-card)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <FiTruck size={19} />
                </span>

                <div>
                  <h2
                    id="update-dispatch-title"
                    className="font-heading text-base font-extrabold text-[var(--color-ink)] sm:text-lg"
                  >
                    Update Dispatch Status
                  </h2>
                  <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                    Review the status change before confirming.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--color-border)] text-[var(--color-muted)] transition hover:bg-[var(--color-paper)] disabled:opacity-50"
              >
                <FiX size={17} />
              </button>
            </div>

            {/* Content */}
            <div className="space-y-5 p-5">
              <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-paper)] p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-muted)]">
                  Order
                </p>

                <p className="mt-1 text-sm font-extrabold text-[var(--color-ink)]">
                  {dispatch.orderNumber}
                </p>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {dispatch.customer.fullName}
                </p>

                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  {dispatch.destination.city}, {dispatch.destination.state}
                </p>
              </div>

              <div>
                <p className="mb-3 text-xs font-bold text-[var(--color-ink)]">
                  Status transition
                </p>

                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] p-3">
                    <p className="mb-2 text-[10px] text-[var(--color-muted)]">
                      Current status
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[dispatch.status]}`}
                    >
                      {getDispatchStatusLabel(dispatch.status)}
                    </span>
                  </div>

                  <FiArrowRight
                    size={19}
                    className="shrink-0 text-[var(--color-muted)]"
                  />

                  <div className="min-w-0 flex-1 rounded-xl border border-[var(--color-accent)]/30 bg-[var(--color-accent-soft)]/40 p-3">
                    <p className="mb-2 text-[10px] text-[var(--color-muted)]">
                      New status
                    </p>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyles[nextStatus]}`}
                    >
                      {getDispatchStatusLabel(nextStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={`flex items-start gap-3 rounded-xl p-3 ${
                  isDelivered
                    ? "bg-[var(--color-success-soft)]"
                    : "bg-[var(--color-accent-soft)]"
                }`}
              >
                {isDelivered ? (
                  <FiCheckCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-success)]"
                  />
                ) : (
                  <FiAlertCircle
                    size={17}
                    className="mt-0.5 shrink-0 text-[var(--color-accent)]"
                  />
                )}

                <p className="text-xs leading-5 text-[var(--color-ink)]">
                  {isDelivered
                    ? "Confirming this change will mark the order as delivered and record the delivery time."
                    : `This will update the dispatch to ${getDispatchStatusLabel(nextStatus)}. Make sure the delivery information is accurate before continuing.`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col-reverse gap-2 border-t border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="h-11 rounded-[var(--radius-control)] border border-[var(--color-border-strong)] bg-white px-5 text-xs font-bold text-[var(--color-ink)] transition hover:bg-[var(--color-stone)] disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={onConfirm}
                disabled={saving}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-5 text-xs font-bold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    Updating...
                  </>
                ) : (
                  <>
                    Confirm Update
                    <FiArrowRight size={15} />
                  </>
                )}
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
