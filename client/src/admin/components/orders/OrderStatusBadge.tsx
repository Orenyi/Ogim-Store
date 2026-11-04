import type { OrderFulfilmentStatus } from "../../types/orders.types";

const styles: Record<
  OrderFulfilmentStatus,
  { label: string; background: string; color: string }
> = {
  pending_dispatch: {
    label: "Pending Dispatch",
    background: "var(--color-warning-soft)",
    color: "var(--color-warning)",
  },
  processing: {
    label: "Processing",
    background: "#E4F1FF",
    color: "#1769AA",
  },
  dispatched: {
    label: "Dispatched",
    background: "#EFE8FF",
    color: "#7040C0",
  },
  in_transit: {
    label: "In Transit",
    background: "var(--color-accent-soft)",
    color: "var(--color-accent)",
  },
  delivered: {
    label: "Delivered",
    background: "var(--color-success-soft)",
    color: "var(--color-success)",
  },
  cancelled: {
    label: "Cancelled",
    background: "var(--color-error-soft)",
    color: "var(--color-error)",
  },
};

type Props = {
  status: OrderFulfilmentStatus;
};

export default function OrderStatusBadge({ status }: Props) {
  const style = styles[status];

  return (
    <span
      className="inline-flex items-center whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-semibold"
      style={{
        backgroundColor: style.background,
        color: style.color,
      }}
    >
      {style.label}
    </span>
  );
}
