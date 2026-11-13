import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FiX, FiMapPin, FiSave } from "react-icons/fi";
import { createPortal } from "react-dom";
import type {
  DeliveryFee,
  DeliveryFeeInput,
  DeliveryFeeStatus,
} from "../../types/delivery.types";
import { formatDeliveryCurrency } from "../../utils/delivery.utils";

type Props = {
  open: boolean;
  fee?: DeliveryFee | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: DeliveryFeeInput) => Promise<void>;
};

const initialForm: DeliveryFeeInput = {
  location: "",
  state: "",
  country: "Nigeria",
  fee: 2500,
  estimatedDelivery: "1 – 2 days",
  status: "active",
};

const inputClass =
  "mt-2 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 py-3 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";

export default function DeliveryFeeModal({
  open,
  fee,
  saving,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<DeliveryFeeInput>(initialForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setForm(
        fee
          ? {
              location: fee.location,
              state: fee.state,
              country: fee.country,
              fee: fee.fee,
              estimatedDelivery: fee.estimatedDelivery,
              status: fee.status,
            }
          : initialForm,
      );
      setError("");
    }
  }, [open, fee]);

  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !saving) onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, saving, onClose]);

  function update<K extends keyof DeliveryFeeInput>(
    key: K,
    value: DeliveryFeeInput[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.location.trim() || !form.state.trim()) {
      setError("Enter both a location and a state.");
      return;
    }

    if (!Number.isFinite(form.fee) || form.fee < 0) {
      setError("Enter a valid delivery fee.");
      return;
    }

    if (!form.estimatedDelivery.trim()) {
      setError("Enter an estimated delivery time.");
      return;
    }

    try {
      await onSubmit({
        ...form,
        location: form.location.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        estimatedDelivery: form.estimatedDelivery.trim(),
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save delivery fee.",
      );
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-[rgba(21,23,28,0.55)] p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) onClose();
          }}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="delivery-fee-modal-title"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="max-h-[92dvh] w-full max-w-xl overflow-y-auto rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-paper)] shadow-[var(--shadow-dropdown)] sm:rounded-2xl"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-paper)] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  <FiMapPin size={20} />
                </span>
                <div>
                  <h2
                    id="delivery-fee-modal-title"
                    className="font-heading text-lg font-extrabold text-[var(--color-ink)]"
                  >
                    {fee ? "Edit Delivery Fee" : "Add Delivery Fee"}
                  </h2>
                  <p className="text-xs text-[var(--color-muted)]">
                    Set the delivery price for a location.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Close modal"
                className="flex h-9 w-9 items-center justify-center rounded-full text-[var(--color-muted)] transition hover:bg-[var(--color-stone)] hover:text-[var(--color-ink)] disabled:opacity-50"
              >
                <FiX size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-[var(--color-ink)]">
                  Location *
                  <input
                    className={inputClass}
                    value={form.location}
                    onChange={(event) => update("location", event.target.value)}
                    placeholder="e.g. Ikeja"
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-[var(--color-ink)]">
                  State / FCT *
                  <input
                    className={inputClass}
                    value={form.state}
                    onChange={(event) => update("state", event.target.value)}
                    placeholder="e.g. Lagos"
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-[var(--color-ink)]">
                  Country
                  <input
                    className={inputClass}
                    value={form.country}
                    onChange={(event) => update("country", event.target.value)}
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-[var(--color-ink)]">
                  Delivery fee (₦) *
                  <input
                    className={inputClass}
                    type="number"
                    min="0"
                    step="100"
                    value={form.fee}
                    onChange={(event) =>
                      update("fee", Number(event.target.value))
                    }
                    required
                  />
                  <span className="mt-1 block text-xs font-normal text-[var(--color-muted)]">
                    Preview: {formatDeliveryCurrency(form.fee || 0)}
                  </span>
                </label>

                <label className="text-sm font-semibold text-[var(--color-ink)] sm:col-span-2">
                  Estimated delivery *
                  <input
                    className={inputClass}
                    value={form.estimatedDelivery}
                    onChange={(event) =>
                      update("estimatedDelivery", event.target.value)
                    }
                    placeholder="e.g. 1 – 2 days"
                    required
                  />
                </label>

                <label className="text-sm font-semibold text-[var(--color-ink)] sm:col-span-2">
                  Status
                  <select
                    className={inputClass}
                    value={form.status}
                    onChange={(event) =>
                      update("status", event.target.value as DeliveryFeeStatus)
                    }
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </label>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-[var(--color-error)]/20 bg-[var(--color-error-soft)] px-3 py-2.5 text-sm text-[var(--color-error)]"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col-reverse gap-3 border-t border-[var(--color-border)] pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="rounded-xl border border-[var(--color-border-strong)] px-5 py-3 text-sm font-semibold text-[var(--color-ink)] transition hover:bg-[var(--color-stone)] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave size={16} />
                  {saving
                    ? "Saving..."
                    : fee
                      ? "Save Changes"
                      : "Add Delivery Fee"}
                </button>
              </div>
            </form>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
