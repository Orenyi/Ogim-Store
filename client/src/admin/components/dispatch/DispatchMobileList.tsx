import { FiCopy, FiMapPin, FiMoreHorizontal, FiTruck } from "react-icons/fi";

import type { DispatchOrder } from "../../types/dispatch.types";
import { formatDispatchDate } from "../../utils/dispatch.utils";
import DispatchStatusBadge from "./DispatchStatusBadge";

type Props = {
  dispatches: DispatchOrder[];
  onUpdateStatus: (dispatch: DispatchOrder) => void;
  onAssign: (dispatch: DispatchOrder) => void;
};

export default function DispatchMobileList({
  dispatches,
  onUpdateStatus,
  onAssign,
}: Props) {
  async function copyTracking(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access may be unavailable.
    }
  }

  return (
    <div className="grid gap-3 md:hidden">
      {dispatches.map((dispatch) => (
        <article
          key={dispatch.id}
          className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white p-3 shadow-[var(--shadow-sm)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-[var(--color-ink)]">
                {dispatch.orderNumber}
              </p>
              <p className="mt-1 truncate text-xs text-[var(--color-muted)]">
                {dispatch.customer.fullName}
              </p>
            </div>

            <DispatchStatusBadge status={dispatch.status} />
          </div>

          <div className="mt-3 flex items-start gap-2 text-xs text-[var(--color-muted)]">
            <FiMapPin size={15} className="mt-0.5 shrink-0" />
            <span>
              {dispatch.destination.addressLine}, {dispatch.destination.city},{" "}
              {dispatch.destination.state}
            </span>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3 border-t border-[var(--color-border)] pt-3">
            <div>
              <p className="text-[10px] text-[var(--color-muted)]">
                Delivery partner
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-[var(--color-ink)]">
                <FiTruck size={13} className="text-[var(--color-accent)]" />
                {dispatch.deliveryPartner ?? "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-[var(--color-muted)]">
                Dispatched
              </p>
              <p className="mt-1 text-xs font-semibold text-[var(--color-ink)]">
                {formatDispatchDate(dispatch.dispatchedAt)}
              </p>
            </div>
          </div>

          {dispatch.trackingNumber && (
            <button
              type="button"
              onClick={() => void copyTracking(dispatch.trackingNumber!)}
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-accent)]"
            >
              <FiCopy size={13} />
              {dispatch.trackingNumber}
            </button>
          )}

          <div className="mt-3 flex justify-end border-t border-[var(--color-border)] pt-3">
            {dispatch.status === "pending" ? (
              <button
                type="button"
                onClick={() => onAssign(dispatch)}
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] bg-[var(--color-accent)] px-4 text-xs font-bold text-white"
              >
                <FiTruck size={14} />
                Assign Dispatch
              </button>
            ) : dispatch.status !== "delivered" ? (
              <button
                type="button"
                onClick={() => onUpdateStatus(dispatch)}
                className="inline-flex h-9 items-center gap-2 rounded-[var(--radius-control)] border border-[var(--color-border)] px-4 text-xs font-bold text-[var(--color-ink)]"
              >
                <FiMoreHorizontal size={15} />
                Update Status
              </button>
            ) : null}
          </div>
        </article>
      ))}

      {dispatches.length === 0 && (
        <div className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-white px-4 py-12 text-center">
          <FiTruck className="mx-auto text-2xl text-[var(--color-muted)]" />
          <p className="mt-3 text-sm font-bold">No dispatches found</p>
          <p className="mt-1 text-xs text-[var(--color-muted)]">
            Try another search or filter.
          </p>
        </div>
      )}
    </div>
  );
}
