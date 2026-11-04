import type { DispatchStatus } from "../../types/dispatch.types";
import { getDispatchStatusLabel } from "../../utils/dispatch.utils";

const styles: Record<DispatchStatus, string> = {
  pending: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  dispatched: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  in_transit: "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
  delivered: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
};

export default function DispatchStatusBadge({
  status,
}: {
  status: DispatchStatus;
}) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold ${styles[status]}`}
    >
      {getDispatchStatusLabel(status)}
    </span>
  );
}
