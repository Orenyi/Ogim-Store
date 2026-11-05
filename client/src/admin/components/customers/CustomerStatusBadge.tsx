import type { CustomerStatus } from "../../types/customers.types";

type Props = {
  status: CustomerStatus;
};

export default function CustomerStatusBadge({ status }: Props) {
  const active = status === "active";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        active
          ? "bg-[var(--color-success-soft)] text-[var(--color-success)]"
          : "bg-[var(--color-surface-muted)] text-[var(--color-muted)]"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          active ? "bg-[var(--color-success)]" : "bg-[var(--color-muted)]"
        }`}
      />
      {active ? "Active" : "Inactive"}
    </span>
  );
}
