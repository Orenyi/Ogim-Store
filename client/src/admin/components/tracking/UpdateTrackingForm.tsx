import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { FiTruck, FiSearch, FiSend } from "react-icons/fi";
import type {
  TrackingOrder,
  TrackingStatus,
  TrackingUpdateInput,
} from "../../types/tracking.types";

type Props = {
  orders: TrackingOrder[];
  selectedOrder: TrackingOrder | null;
  saving: boolean;
  onSelectOrder: (order: TrackingOrder | null) => void;
  onSubmit: (input: TrackingUpdateInput) => Promise<void>;
};

const inputClass =
  "mt-2 h-11 w-full rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 text-sm text-[var(--color-ink)] outline-none transition focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";

export default function UpdateTrackingForm({
  orders,
  selectedOrder,
  saving,
  onSelectOrder,
  onSubmit,
}: Props) {
  const [orderSearch, setOrderSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [status, setStatus] = useState<TrackingStatus | "">("");
  const [partner, setPartner] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedOrder) {
      setStatus("");
      setPartner("");
      setTrackingNumber("");
      setNote("");
      return;
    }

    setOrderSearch(selectedOrder.orderId);
    setStatus(selectedOrder.status);
    setPartner(selectedOrder.deliveryPartner);
    setTrackingNumber(selectedOrder.trackingNumber);
    setNote("");
    setError("");
  }, [selectedOrder]);

  const filteredOrders = orders.filter((order) => {
    const search = orderSearch.toLowerCase();

    return (
      order.orderId.toLowerCase().includes(search) ||
      order.customer.fullName.toLowerCase().includes(search) ||
      order.trackingNumber.toLowerCase().includes(search)
    );
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedOrder) {
      setError("Select an order first.");
      return;
    }

    if (!status) {
      setError("Select a tracking status.");
      return;
    }

    if (!note.trim()) {
      setError("Add a customer-visible tracking note.");
      return;
    }

    try {
      await onSubmit({
        orderId: selectedOrder.id,
        status,
        note: note.trim(),
        trackingNumber: trackingNumber.trim(),
        deliveryPartner: partner.trim(),
      });

      setNote("");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update tracking.",
      );
    }
  }

  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-white)] p-4 shadow-[var(--shadow-card)] sm:p-5">
      <div className="flex items-center gap-3 border-b border-[var(--color-border)] pb-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
          <FiTruck size={20} />
        </span>
        <div>
          <h2 className="font-heading text-base font-extrabold text-[var(--color-ink)]">
            Update Tracking
          </h2>
          <p className="mt-0.5 text-xs text-[var(--color-muted)]">
            Add a new tracking update for an order.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
        <div className="relative">
          <label className="text-xs font-semibold text-[var(--color-ink)]">
            Order ID *
          </label>

          <div className="relative">
            <input
              value={orderSearch}
              onChange={(event) => {
                setOrderSearch(event.target.value);
                setDropdownOpen(true);
                if (selectedOrder) onSelectOrder(null);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="e.g. #OGM-10421"
              className={`${inputClass} pr-10`}
            />
            <FiSearch
              size={17}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--color-muted)]"
            />
          </div>

          {dropdownOpen && (
            <>
              <button
                type="button"
                aria-label="Close order selection"
                className="fixed inset-0 z-20 cursor-default"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-56 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-white)] p-1 shadow-[var(--shadow-dropdown)]">
                {filteredOrders.length ? (
                  filteredOrders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => {
                        onSelectOrder(order);
                        setDropdownOpen(false);
                      }}
                      className="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left transition hover:bg-[var(--color-surface-muted)]"
                    >
                      <span className="min-w-0">
                        <span className="block text-sm font-bold text-[var(--color-ink)]">
                          {order.orderId}
                        </span>
                        <span className="block truncate text-xs text-[var(--color-muted)]">
                          {order.customer.fullName} · {order.trackingNumber}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs text-[var(--color-muted)]">
                        {order.destination}
                      </span>
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-4 text-center text-xs text-[var(--color-muted)]">
                    No matching orders found.
                  </p>
                )}
              </div>
            </>
          )}
        </div>

        {selectedOrder && (
          <div className="rounded-xl bg-[var(--color-surface-muted)] p-3">
            <p className="text-xs text-[var(--color-muted)]">
              Selected customer
            </p>
            <p className="mt-1 text-sm font-bold text-[var(--color-ink)]">
              {selectedOrder.customer.fullName}
            </p>
            <p className="mt-0.5 text-xs text-[var(--color-muted)]">
              {selectedOrder.destination}
            </p>
          </div>
        )}

        <div>
          <label className="text-xs font-semibold text-[var(--color-ink)]">
            Status *
          </label>
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as TrackingStatus | "")
            }
            className={inputClass}
            required
          >
            <option value="">Select status</option>
            <option value="processing">Processing</option>
            <option value="dispatched">Dispatched</option>
            <option value="in_transit">In Transit</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-ink)]">
            Delivery Partner
          </label>
          <input
            value={partner}
            onChange={(event) => setPartner(event.target.value)}
            placeholder="e.g. GIGL Logistics"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-ink)]">
            Tracking Number
          </label>
          <input
            value={trackingNumber}
            onChange={(event) => setTrackingNumber(event.target.value)}
            placeholder="Enter tracking number"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs font-semibold text-[var(--color-ink)]">
            Tracking Note (visible to customer) *
          </label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="e.g. Your package is in transit to your location."
            rows={3}
            maxLength={500}
            className="mt-2 w-full resize-y rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-white)] px-3.5 py-3 text-sm text-[var(--color-ink)] outline-none transition placeholder:text-[var(--color-muted)] focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10"
          />
          <p className="mt-1 text-right text-[10px] text-[var(--color-muted)]">
            {note.length}/500
          </p>
        </div>

        {error && (
          <p
            role="alert"
            className="rounded-xl bg-[var(--color-error-soft)] px-3 py-2 text-xs text-[var(--color-error)]"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition hover:bg-[var(--color-accent-hover)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <FiSend size={16} />
          {saving ? "Updating..." : "Update Tracking"}
        </button>
      </form>
    </section>
  );
}
