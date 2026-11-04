import { FiCheckCircle, FiPauseCircle } from "react-icons/fi";
import type { DeliveryFeeStatus } from "../../types/delivery.types";

type Props = {
  status: DeliveryFeeStatus;
};

export default function DeliveryStatusBadge({ status }: Props) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
        active
          ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
          : "bg-[var(--color-stone)] text-[var(--color-muted)]"
      }`}
    >
      {active ? <FiCheckCircle size={13} /> : <FiPauseCircle size={13} />}
      {active ? "Active" : "Inactive"}
    </span>
  );
}
