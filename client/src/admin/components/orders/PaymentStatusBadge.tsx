import { FiCheckCircle, FiClock, FiXCircle, FiRefreshCw } from "react-icons/fi";

import type { OrderPaymentStatus } from "../../types/orders.types";

const config: Record<
  OrderPaymentStatus,
  {
    label: string;
    background: string;
    color: string;
    icon: typeof FiCheckCircle;
  }
> = {
  paid: {
    label: "Paid",
    background: "var(--color-success-soft)",
    color: "var(--color-success)",
    icon: FiCheckCircle,
  },
  pending: {
    label: "Pending",
    background: "var(--color-warning-soft)",
    color: "var(--color-warning)",
    icon: FiClock,
  },
  failed: {
    label: "Failed",
    background: "var(--color-error-soft)",
    color: "var(--color-error)",
    icon: FiXCircle,
  },
  refunded: {
    label: "Refunded",
    background: "var(--color-surface-muted)",
    color: "var(--color-muted)",
    icon: FiRefreshCw,
  },
  partially_refunded: {
    label: "Partially refunded",
    background: "var(--color-warning-soft)",
    color: "var(--color-warning)",
    icon: FiRefreshCw,
  },
};

export default function PaymentStatusBadge({
  status,
}: {
  status: OrderPaymentStatus;
}) {
  const item = config[status];
  const Icon = item.icon;

  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold"
      style={{
        backgroundColor: item.background,
        color: item.color,
      }}
    >
      <Icon size={12} strokeWidth={2.5} />
      {item.label}
    </span>
  );
}
