import { FiCopy, FiMoreHorizontal, FiTruck } from "react-icons/fi";

import type { DispatchOrder } from "../../types/dispatch.types";
import { formatDispatchDate } from "../../utils/dispatch.utils";
import DispatchStatusBadge from "./DispatchStatusBadge";

type Props = {
  dispatches: DispatchOrder[];
  onUpdateStatus: (dispatch: DispatchOrder) => void;
  onAssign: (dispatch: DispatchOrder) => void;
};

export default function DispatchTable({
  dispatches,
  onUpdateStatus,
  onAssign,
}: Props) {
  async function copyTracking(value: string) {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access may be unavailable in an insecure context.
    }
  }

  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full min-w-[950px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--color-border)] text-[11px] font-bold text-[var(--color-muted)]">
            <th className="px-4 py-4">Order ID</th>
            <th className="px-3 py-4">Customer</th>
            <th className="px-3 py-4">Destination</th>
            <th className="px-3 py-4">Partner</th>
            <th className="px-3 py-4">Tracking No.</th>
            <th className="px-3 py-4">Status</th>
            <th className="px-3 py-4">Dispatched</th>
            <th className="px-4 py-4 text-right">Actions</th>
          </tr>
        </thead>

        <tbody>
          {dispatches.map((dispatch) => (
            <tr
              key={dispatch.id}
              className="border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-paper)]/70"
            >
              <td className="px-4 py-4">
                <span className="text-xs font-extrabold text-[var(--color-ink)]">
                  {dispatch.orderNumber}
                </span>
              </td>

              <td className="px-3 py-4">
                <p className="text-xs font-semibold text-[var(--color-ink)]">
                  {dispatch.customer.fullName}
                </p>
                <p className="mt-1 text-[10px] text-[var(--color-muted)]">
                  {dispatch.customer.phoneNumber}
                </p>
              </td>

              <td className="px-3 py-4">
                <p className="text-xs text-[var(--color-ink)]">
                  {dispatch.destination.city}, {dispatch.destination.state}
                </p>
              </td>

              <td className="px-3 py-4">
                <div className="flex items-center gap-2 text-xs text-[var(--color-ink)]">
                  <FiTruck className="shrink-0 text-[var(--color-accent)]" />
                  <span>{dispatch.deliveryPartner ?? "Not assigned"}</span>
                </div>
              </td>

              <td className="px-3 py-4">
                {dispatch.trackingNumber ? (
                  <button
                    type="button"
                    onClick={() => void copyTracking(dispatch.trackingNumber!)}
                    title="Copy tracking number"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--color-ink)] hover:text-[var(--color-accent)]"
                  >
                    {dispatch.trackingNumber}
                    <FiCopy size={12} />
                  </button>
                ) : (
                  <span className="text-xs text-[var(--color-muted)]">—</span>
                )}
              </td>

              <td className="px-3 py-4">
                <DispatchStatusBadge status={dispatch.status} />
              </td>

              <td className="px-3 py-4 text-xs text-[var(--color-muted)]">
                {formatDispatchDate(dispatch.dispatchedAt)}
              </td>

              <td className="px-4 py-4 text-right">
                <div className="inline-flex items-center gap-1">
                  {dispatch.status === "pending" && (
                    <button
                      type="button"
                      onClick={() => onAssign(dispatch)}
                      className="rounded-lg px-2 py-2 text-[10px] font-bold text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]"
                    >
                      Assign
                    </button>
                  )}

                  {dispatch.status !== "delivered" && (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(dispatch)}
                      aria-label={`Update ${dispatch.orderNumber}`}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--color-muted)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-accent)]"
                    >
                      <FiMoreHorizontal size={19} />
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}

          {dispatches.length === 0 && (
            <tr>
              <td colSpan={8} className="px-4 py-16 text-center">
                <FiTruck className="mx-auto text-2xl text-[var(--color-muted)]" />
                <p className="mt-3 text-sm font-bold text-[var(--color-ink)]">
                  No dispatches found
                </p>
                <p className="mt-1 text-xs text-[var(--color-muted)]">
                  Try changing your search or filters.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
