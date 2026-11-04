import type { InventoryStatus } from "../../types/inventory.types";

const statusConfig: Record<
  InventoryStatus,
  { label: string; className: string }
> = {
  in_stock: {
    label: "In Stock",
    className: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  },
  low_stock: {
    label: "Low Stock",
    className: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  },
  out_of_stock: {
    label: "Out of Stock",
    className: "bg-[var(--color-error-soft)] text-[var(--color-error)]",
  },
};

export default function InventoryStatusBadge({
  status,
}: {
  status: InventoryStatus;
}) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1.5 text-[11px] font-bold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
